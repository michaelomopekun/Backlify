# Backlify

Automated PostgreSQL backup & restore platform. **npm workspaces** monorepo:

| Workspace | Path | What |
|---|---|---|
| `web` | `app/web` | Next.js 16 / React 19 app — marketing landing + authenticated dashboard (Tailwind v4) |
| `worker` | `app/worker` | Background backup/restore jobs (BullMQ) |
| `shared` | `package/shared` | Shared types & constants (e.g. job-status enums) |
| `db` | `package/db` | Drizzle schema & migrations |

Package manager is **npm** — use `npm`/`npx` (not pnpm or bun) for every install and CLI command. Run web scripts from the root with `npm run dev:web` / `npm run build:web`, or `npm run <script> --workspace=web`.

## Building or styling UI

When creating or reshaping any UI in `app/web`, these sources work **together** — load all of them, in this order of authority:

1. **`app/web/DESIGN_SYSTEM.md`** — the source of truth for the **product/dashboard** UI. Colors, the slate ramp, brand amber, the status→color table, type scale, spacing, motion specs, and component recipes are defined here. **This doc wins on any Backlify-specific value.** Read it before writing dashboard UI. **Note: this file is gitignored (local-only), so it may be absent on a fresh clone.** When it's missing, the committed `app/web/src/app/globals.css` token block is the fallback source of truth — the `:root` and `[data-surface="marketing"]` tokens there are the same values §4 defines.
2. **`shadcn` skill** — how to build the components: composition rules, semantic tokens (`bg-primary`, not raw hex in markup), CLI usage. Use existing components before custom markup.
3. **`frontend-design` skill** — macro craft and taste: typography, layout, restraint, avoiding templated defaults.
4. **`emil-design-eng` skill** — micro polish and feel: interaction states, animation decisions, and the invisible details that make components feel right. Applies during implementation, once structure and tokens are set.

**Resolving conflicts:** the doc's decisions override the skills' generic defaults. Specifically —
- The product UI type is **already pinned** to JetBrains Mono (`--font-sans`); Instrument Serif is **marketing-only**. `frontend-design`'s "choose a distinctive display/body pairing" applies to *net-new or marketing* directions, not the dashboard.
- Icons are **`@tabler/icons-react`** (never assume `lucide-react`).
- Feed shadcn's CSS variables from the token block in `DESIGN_SYSTEM.md §4` — don't invent parallel tokens.
- Never use raw color values (`bg-blue-500`) in markup; look status colors up from the §1.3 table via semantic tokens.
- `emil-design-eng` guides *how* motion should feel, but the concrete values (durations, easing, reduced-motion, the status pulse) come from `DESIGN_SYSTEM.md §6`.

The two surfaces (**marketing** landing vs **product** dashboard) are intentionally distinct — see `DESIGN_SYSTEM.md §0`. Don't apply the landing's chunky push-button / serif treatment to the dashboard, or vice-versa.

### shadcn setup

shadcn is initialized in `app/web` (`components.json`: `radix-nova` style, `iconLibrary: tabler`, CSS at `src/app/globals.css`, Tailwind v4). Add components with `npx shadcn@latest add <name>` from `app/web`.

Tokens are already aligned to §4 and split by surface in `globals.css`:
- **`:root`** holds the dark-native **dashboard** tokens (§4) — the global default, so shadcn components (and their portals: Dialog, DropdownMenu, Popover) theme correctly everywhere.
- **`[data-surface="marketing"]`** holds the landing tokens; `page.tsx` wraps the landing in it, keeping the marketing look intact.

So new shadcn components inherit dashboard tokens by default. If you ever render one inside the marketing surface, expect it to pick up the landing palette.

Heads up: `init` pulled in `lucide-react` as a dependency even though the icon library is `tabler`. It's unused — keep using `@tabler/icons-react`.
