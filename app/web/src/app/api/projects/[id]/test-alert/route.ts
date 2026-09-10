import { NextRequest, NextResponse } from "next/server";
import { ProjectRepository } from "db";
import { logger } from "shared/config/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    let webhookUrl = body.webhookUrl?.trim();

    const project = await ProjectRepository.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (!webhookUrl) {
      webhookUrl = (project as any).webhookUrl?.trim();
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid webhook destination URL first." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(webhookUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid webhook URL format. Must start with https:// or http://" },
        { status: 400 }
      );
    }

    const payload = {
      event: "backlify.test_alert",
      projectId: id,
      projectName: project.name,
      timestamp: new Date().toISOString(),
      message: "This is a test notification from Backlify verifying your alert webhook integration.",
      data: {
        status: "verified",
        deliveryChannel: "webhook",
        environment: (project as any).environment || "production",
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

    return NextResponse.json({
      success: true,
      statusCode: res.status,
      durationMs,
      message: `Test alert delivered successfully in ${durationMs}ms (HTTP ${res.status}).`,
    });
  } catch (error: any) {
    logger.error(error, "Failed to process test alert webhook");
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
