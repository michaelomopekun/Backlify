import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { ProjectRepository } from "db";
import { decryptDatabaseUrl } from "shared/config/encryption";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let sql: ReturnType<typeof postgres> | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const { projectId, databaseUrl } = body;

    let targetUrl: string | null = null;

    if (projectId) {
      const project = await ProjectRepository.getProjectById(projectId);
      if (!project) {
        return NextResponse.json(
          { success: false, error: "Project not found" },
          { status: 404 }
        );
      }
      targetUrl = project.databaseUrl;
    } else if (databaseUrl && typeof databaseUrl === "string") {
      targetUrl = decryptDatabaseUrl(databaseUrl.trim());
    }

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Please provide a database connection URL or project ID." },
        { status: 400 }
      );
    }

    if (!/^postgres(ql)?:\/\//i.test(targetUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid protocol. Connection string must begin with postgresql:// or postgres://" },
        { status: 400 }
      );
    }

    // Determine SSL requirement from query string or default to prefer
    const urlLower = targetUrl.toLowerCase();
    const sslMode =
      urlLower.includes("sslmode=require") ||
      urlLower.includes("sslmode=verify-full") ||
      urlLower.includes("ssl=true") ||
      urlLower.includes("ssl=1")
        ? "require"
        : "prefer";

    const startTime = Date.now();

    // Open connection with strict 4-second timeout and 1 single connection
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
    // Extract short version e.g. "PostgreSQL 16.2"
    const match = rawVersion.match(/PostgreSQL\s+([\d.]+)/i);
    const shortVersion = match ? `PostgreSQL ${match[1]}` : rawVersion.split(",")[0];

    return NextResponse.json({
      success: true,
      latencyMs,
      version: shortVersion,
      database: firstRow.database_name,
      dbUser: firstRow.db_user,
      isStandby: Boolean(firstRow.is_standby),
      ssl: sslMode === "require" || urlLower.includes("ssl"),
      rawVersion,
    });
  } catch (err: any) {
    const message = err?.message || String(err);
    const code = err?.code || "";

    let userFriendlyError = "Failed to connect to database.";

    if (code === "28P01" || message.includes("password authentication failed")) {
      userFriendlyError = "Authentication failed. Check your database username and password.";
    } else if (code === "3D000" || message.includes("database") && message.includes("does not exist")) {
      userFriendlyError = "Database does not exist. Check the database name in your connection string.";
    } else if (code === "ECONNREFUSED" || message.includes("ECONNREFUSED")) {
      userFriendlyError = "Connection refused. Verify the host and port, and ensure your database is running.";
    } else if (code === "ETIMEDOUT" || message.includes("timeout") || message.includes("ETIMEDOUT")) {
      userFriendlyError = "Connection timed out (4s). The database host may be behind a firewall or security group.";
    } else if (code === "ENOTFOUND" || message.includes("ENOTFOUND")) {
      userFriendlyError = "Host not found. Verify the hostname or domain in your connection string.";
    } else if (message.includes("SSL") || message.includes("certificate") || message.includes("no pg_hba.conf entry for host")) {
      userFriendlyError = "SSL / Access Control rejection. Verify pg_hba.conf and try adding ?sslmode=require.";
    } else {
      userFriendlyError = message;
    }

    return NextResponse.json(
      {
        success: false,
        error: userFriendlyError,
        errorCode: code,
      },
      { status: 200 } // Return 200 with success: false so client can render structured diagnostics
    );
  } finally {
    if (sql) {
      try {
        await sql.end({ timeout: 1 });
      } catch {}
    }
  }
}
