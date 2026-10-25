import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import net from "net";
import { decryptDatabaseUrl } from "shared/config/encryption";
import { getBacklifyEgressIp } from "shared/config/network";
import { validateSafeDatabaseUrl, detectDatabaseEngine } from "shared/config/security";
import { requireAuth, authorizeProject } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse, attachRateLimitHeaders, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Require Authentication
  const auth = await requireAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  // 2. Sliding window Rate Limiting (10 tests per 60 seconds per user / IP)
  const identifier = auth.user.id || getClientIp(req);
  const rateLimit = await checkRateLimit(`test-conn:${identifier}`, 10, 60);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, "Too many connection test attempts. Please wait a moment before testing again.");
  }

  let sql: ReturnType<typeof postgres> | null = null;
  let targetUrl: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const { projectId, databaseUrl, databaseEngine, engine: inputEngine } = body;
    const requestedEngine = inputEngine || databaseEngine;

    // 3. Project-scoped authorization or direct URL verification
    if (projectId) {
      const projectAuth = await authorizeProject(projectId, "member");
      if (!projectAuth.authorized) {
        return projectAuth.response;
      }
      targetUrl = projectAuth.project.databaseUrl;
    } else if (databaseUrl && typeof databaseUrl === "string") {
      targetUrl = decryptDatabaseUrl(databaseUrl.trim());
    }

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Please provide a database connection URL or project ID." },
        { status: 400 }
      );
    }

    // 4. Validate protocol & SSRF Defense
    const ssrfCheck = await validateSafeDatabaseUrl(targetUrl, { expectedEngine: databaseEngine });
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: ssrfCheck.error || "Prohibited target: private network and loopback destinations are restricted for security.",
          isSecurityViolation: true,
        },
        { status: 400 }
      );
    }

    const engine = requestedEngine || ssrfCheck.engine || detectDatabaseEngine(targetUrl);
    const urlLower = targetUrl.toLowerCase();
    const startTime = Date.now();

    // 5. Engine-Specific Connection Probe
    if (engine === "postgres") {
      const sslMode =
        urlLower.includes("sslmode=require") ||
        urlLower.includes("sslmode=verify-full") ||
        urlLower.includes("ssl=true") ||
        urlLower.includes("ssl=1")
          ? "require"
          : "prefer";

      sql = postgres(targetUrl, {
        connect_timeout: 4,
        idle_timeout: 1,
        max: 1,
        ssl: sslMode as any,
      });

      const rows = await sql`
        SELECT 
          version() as full_version,
          current_database() as database_name,
          pg_is_in_recovery() as is_standby,
          current_user as db_user
      `;

      const latencyMs = Math.max(1, Date.now() - startTime);
      if (!rows || rows.length === 0) {
        throw new Error("No response from PostgreSQL server query.");
      }

      const firstRow = rows[0];
      const rawVersion = firstRow.full_version || "PostgreSQL";
      const match = rawVersion.match(/PostgreSQL\s+([\d.]+)/i);
      const shortVersion = match ? `PostgreSQL ${match[1]}` : rawVersion.split(",")[0];

      const response = NextResponse.json({
        success: true,
        engine: "postgres",
        latencyMs,
        version: shortVersion,
        database: firstRow.database_name,
        dbUser: firstRow.db_user,
        isStandby: Boolean(firstRow.is_standby),
        ssl: sslMode === "require" || urlLower.includes("ssl"),
        rawVersion,
      });

      return attachRateLimitHeaders(response, rateLimit);
    }

    if (engine === "mysql") {
      // Connect to MySQL server socket and parse initial handshake packet containing server version
      const parsed = new URL(targetUrl.replace(/^mysqlx?:\/\//i, "http://"));
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 3306;

      const handshake = await new Promise<{ version: string; latencyMs: number }>((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);
        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("Connection timed out (4s) connecting to MySQL host"));
        });
        socket.on("error", (e) => reject(e));
        socket.on("data", (data) => {
          const latency = Math.max(1, Date.now() - startTime);
          socket.destroy();
          // MySQL handshake packet format: 4 byte header, 1 byte protocol (usually 10), null-terminated version string
          if (data.length > 5 && data[4] === 10) {
            const nullIdx = data.indexOf(0, 5);
            if (nullIdx > 5) {
              const ver = data.subarray(5, nullIdx).toString("ascii");
              return resolve({ version: `MySQL ${ver}`, latencyMs: latency });
            }
          }
          resolve({ version: "MySQL Server", latencyMs: latency });
        });
        socket.connect(port, host);
      });

      const response = NextResponse.json({
        success: true,
        engine: "mysql",
        latencyMs: handshake.latencyMs,
        version: handshake.version,
        database: parsed.pathname.replace(/^\//, "") || "default",
        ssl: urlLower.includes("ssl"),
      });

      return attachRateLimitHeaders(response, rateLimit);
    }

    if (engine === "mongodb") {
      const parsed = new URL(targetUrl.replace(/^mongodb(\+srv)?:\/\//i, "http://"));
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 27017;

      const probe = await new Promise<{ latencyMs: number }>((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);
        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("Connection timed out (4s) connecting to MongoDB cluster"));
        });
        socket.on("error", (e) => reject(e));
        socket.on("connect", () => {
          const latency = Math.max(1, Date.now() - startTime);
          socket.destroy();
          resolve({ latencyMs: latency });
        });
        socket.connect(port, host);
      });

      const response = NextResponse.json({
        success: true,
        engine: "mongodb",
        latencyMs: probe.latencyMs,
        version: "MongoDB Cluster",
        database: parsed.pathname.replace(/^\//, "") || "admin",
        ssl: targetUrl.includes("+srv") || urlLower.includes("ssl"),
      });

      return attachRateLimitHeaders(response, rateLimit);
    }

    return NextResponse.json(
      { success: false, error: `Unsupported database engine: ${engine}` },
      { status: 400 }
    );
  } catch (err: any) {
    const message = err?.message || String(err);
    const code = err?.code || "";

    let userFriendlyError = "Failed to connect to database.";

    if (code === "28P01" || message.includes("password authentication failed") || message.includes("NOAUTH") || message.includes("WRONGPASS")) {
      userFriendlyError = "Authentication failed. Check your database username and password.";
    } else if (code === "3D000" || (message.includes("database") && message.includes("does not exist"))) {
      userFriendlyError = "Database does not exist. Check the database name in your connection string.";
    } else if (code === "ECONNREFUSED" || message.includes("ECONNREFUSED")) {
      userFriendlyError = "Connection refused. Verify the host and port, and ensure your database service is running.";
    } else if (code === "ETIMEDOUT" || message.includes("timeout") || message.includes("ETIMEDOUT")) {
      userFriendlyError = "Connection timed out (4s). The database host may be behind a firewall or security group.";
    } else if (code === "ENOTFOUND" || message.includes("ENOTFOUND")) {
      userFriendlyError = "Host not found. Verify the hostname or domain in your connection string.";
    } else if (message.includes("SSL") || message.includes("certificate") || message.includes("no pg_hba.conf entry for host")) {
      userFriendlyError = "SSL / Access Control rejection. Verify database host permissions and SSL parameters.";
    } else {
      userFriendlyError = message;
    }

    const isFirewallLikely =
      code === "ETIMEDOUT" ||
      message.includes("timeout") ||
      message.includes("ETIMEDOUT") ||
      message.includes("no pg_hba.conf entry") ||
      (code === "ECONNREFUSED" && !targetUrl?.includes("localhost") && !targetUrl?.includes("127.0.0.1"));

    const response = NextResponse.json(
      {
        success: false,
        error: userFriendlyError,
        errorCode: code,
        isFirewallLikely,
        egressIp: getBacklifyEgressIp(),
      },
      { status: 200 }
    );

    return attachRateLimitHeaders(response, rateLimit);
  } finally {
    if (sql) {
      try {
        await sql.end({ timeout: 1 });
      } catch {}
    }
  }
}
