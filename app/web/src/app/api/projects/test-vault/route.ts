import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "shared/config/storage";
import { ProjectRepository } from "db";
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
  const rateLimit = await checkRateLimit(`test-vault:${identifier}`, 10, 60);
  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Too many vault connection attempts. Please wait a moment before testing again."
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      projectId,
      provider,
      endpoint,
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
    } = body;

    let finalSecretKey = secretAccessKey;

    // If testing an existing project and secret is masked or missing, load stored secret
    if (projectId) {
      const projectAuth = await authorizeProject(projectId, "member");
      if (!projectAuth.authorized) {
        return projectAuth.response;
      }

      if (!finalSecretKey || finalSecretKey.includes("••••")) {
        const fullProject = await ProjectRepository.getProjectById(projectId);
        if (fullProject?.vaultSecretKey) {
          finalSecretKey = fullProject.vaultSecretKey;
        }
      }
    }

    if (!bucket || !accessKeyId || !finalSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Bucket Name, Access Key ID, and Secret Access Key are required to test vault connectivity.",
        },
        { status: 400 }
      );
    }

    const result = await StorageService.testVaultConnection({
      provider: provider || "s3",
      endpoint,
      bucket,
      region,
      accessKeyId,
      secretAccessKey: finalSecretKey,
    });

    const response = NextResponse.json(result);
    return attachRateLimitHeaders(response, rateLimit);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to test storage vault connection.",
      },
      { status: 500 }
    );
  }
}
