import { NextRequest, NextResponse } from "next/server";
import { logger } from "shared/config/logger";
import { validateSafeWebhookUrl } from "shared/config/security";
import { authorizeProject } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse, attachRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    // 1. Authorize: user must have admin or owner role on the project's org
    const auth = await authorizeProject(id, "admin");
    if (!auth.authorized) {
      return auth.response;
    }

    // 2. Rate limit (10 test alerts per 60s per user)
    const rateLimit = await checkRateLimit(`test-alert:${auth.user.id}`, 10, 60);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, "Too many alert tests requested. Please wait before testing again.");
    }

    const body = await req.json().catch(() => ({}));
    let webhookUrl = body.webhookUrl?.trim();

    if (!webhookUrl) {
      webhookUrl = (auth.project as any).webhookUrl?.trim();
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid webhook destination URL first." },
        { status: 400 }
      );
    }

    // 3. SSRF Protection: Validate that webhook destination does not point to internal networks or cloud metadata
    const ssrfCheck = await validateSafeWebhookUrl(webhookUrl);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: ssrfCheck.error || "Restricted webhook destination. Webhook endpoints must be publicly routable.",
        },
        { status: 400 }
      );
    }

    const payload = {
      event: "backlify.test_alert",
      projectId: id,
      projectName: auth.project.name,
      timestamp: new Date().toISOString(),
      message: "This is a test notification from Backlify verifying your alert webhook integration.",
      data: {
        status: "verified",
        deliveryChannel: "webhook",
        environment: (auth.project as any).environment || "production",
      },
    };

    logger.info({ projectId: id, webhookUrl }, "Dispatching test alert webhook");

    const startTime = Date.now();
    let res: Response;
    try {
      res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Backlify-Webhook-Agent/1.0",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === "TimeoutError") {
        return NextResponse.json(
          { success: false, error: "Webhook endpoint timed out after 5,000ms. Check your server latency or firewall." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to connect to webhook URL: ${fetchErr.message}` },
        { status: 502 }
      );
    }

    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          statusCode: res.status,
          error: `Webhook server returned HTTP ${res.status}${text ? `: ${text.slice(0, 100)}` : ""}`,
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      statusCode: res.status,
      durationMs,
      message: `Test alert delivered successfully in ${durationMs}ms (HTTP ${res.status}).`,
    });

    return attachRateLimitHeaders(response, rateLimit);
  } catch (error: any) {
    logger.error(error, "Failed to process test alert webhook");
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
