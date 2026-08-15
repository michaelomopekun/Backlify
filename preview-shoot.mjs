// One-off visual smoke test for the Backlify dashboard.
//
// Drives headless Chromium against the running dev server, screenshots each
// route at the Figma design width (1440), and reports any console/page errors
// plus whether Next's dev error overlay showed up. Not committed — throwaway.
//
//   node preview-shoot.mjs                 # defaults to http://localhost:3000
//   BASE=http://localhost:3001 node preview-shoot.mjs
//
// Needs: npm i playwright --no-save  &&  npx playwright install chromium

import { chromium } from "playwright";
import { mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

// The chromium-headless-shell download failed (network blip), but the full
// Chrome build is on disk. Find it so we don't depend on the shell.
function findFullChrome() {
  const base = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (!existsSync(base)) return null;
  const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d));
  for (const d of dirs) {
    const exe = path.join(base, d, "chrome-win64", "chrome.exe");
    if (existsSync(exe)) return exe;
  }
  return null;
}

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = path.join("app", "web", ".next", "preview", "shots");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: "01-marketing", url: "/" },
  { name: "02-dashboard", url: "/dashboard" },
  { name: "03-projects", url: "/dashboard/projects" },
  { name: "04-backups", url: "/dashboard/backups" },
];

const exe = findFullChrome();
if (exe) console.log(`using full Chrome: ${exe}`);
else console.log("full Chrome not found — falling back to Playwright default");
const browser = await chromium.launch({
  headless: true,
  ...(exe ? { executablePath: exe } : {}),
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1024 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const report = [];

for (const route of ROUTES) {
  const errors = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  let status = "ok";
  try {
    const resp = await page.goto(`${BASE}${route.url}`, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    // Let fonts/charts settle (recharts animates on mount).
    await page.waitForTimeout(1200);
    if (resp && !resp.ok()) status = `HTTP ${resp.status()}`;
  } catch (err) {
    status = `NAV FAILED: ${err.message.split("\n")[0]}`;
  }

  // Next renders a dev error overlay when a render throws. Match the error
  // dialog specifically — NOT <nextjs-portal>, which Next 16 always mounts to
  // host the dev-tools badge, so keying on it flags every healthy route.
  const overlay = await page
    .locator("[data-nextjs-dialog], #nextjs__container_errors_label")
    .count()
    .catch(() => 0);
  if (overlay > 0) status = "RENDER ERROR (Next overlay visible)";

  const file = path.join(OUT, `${route.name}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});

  // Dashboard-only: measure the layout instead of eyeballing a screenshot.
  // Tells us definitively whether the content wrapper actually receives its
  // lg:pl-60 offset, and whether the sidebar overlap is real vs a fullPage
  // fixed-element artifact (the viewport shot renders fixed elements truthfully).
  if (route.url === "/dashboard") {
    const probe = await page
      .evaluate(() => {
        // AppSidebar returns a fragment (<aside> + mobile <nav>), so the shell's
        // DOM children are [aside, nav, div.lg:pl-60] — the wrapper is the only
        // direct-child <div>, not children[1] (that's the mobile nav).
        const shell = document.querySelector('[data-surface="product"]');
        const wrap = shell?.querySelector(":scope > div") ?? null;
        const aside = document.querySelector("aside");
        const px = (el) => (el ? getComputedStyle(el).paddingLeft : "(none)");
        const rect = (el) => {
          if (!el) return "(none)";
          const r = el.getBoundingClientRect();
          return `x=${Math.round(r.x)} w=${Math.round(r.width)}`;
        };
        return {
          innerWidth: window.innerWidth,
          matchesLg: window.matchMedia("(min-width: 64rem)").matches,
          wrapClass: wrap?.getAttribute("class") ?? "(no wrap)",
          wrapPaddingLeft: px(wrap),
          wrapRect: rect(wrap),
          asidePosition: aside ? getComputedStyle(aside).position : "(no aside)",
          asideRect: rect(aside),
        };
      })
      .catch((e) => ({ error: e.message }));
    console.log("    layout probe:", JSON.stringify(probe));
    await page
      .screenshot({ path: path.join(OUT, "02-dashboard-viewport.png"), fullPage: false })
      .catch(() => {});
  }

  report.push({ route: route.url, status, errors, file });
  console.log(`\n=== ${route.url} -> ${status}`);
  console.log(`    saved ${file}`);
  if (errors.length) {
    console.log(`    ${errors.length} browser error(s):`);
    for (const e of errors.slice(0, 8)) console.log(`      - ${e}`);
  } else {
    console.log("    no browser errors");
  }
}

await browser.close();
console.log("\n---- SUMMARY ----");
for (const r of report) console.log(`${r.status.padEnd(28)} ${r.route}`);
