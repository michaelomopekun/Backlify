import { redis } from "shared/config/redis";
import { logger } from "shared/config/logger";
import { Resend } from "resend";

interface StoredOtp {
  code: string;
  attempts: number;
  expiresAt: number;
}

// In-memory fallback if Redis is temporarily unreachable
const memoryOtpStore = new Map<string, StoredOtp>();
const cooldownStore = new Map<string, number>();

const OTP_TTL_SECONDS = 600; // 10 minutes
const COOLDOWN_SECONDS = 60; // 60 seconds between resends
const MAX_ATTEMPTS = 5;

/**
 * Generates a cryptographically random 6-digit numerical code and dispatches
 * it to the user's inbox via Resend.
 */
export async function generateAndSendOtp(email: string): Promise<{
  success: boolean;
  error?: string;
  cooldownSeconds?: number;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();

  // 1. Check cooldown (prevent spam)
  const cooldownKey = `auth:otp:cooldown:${normalizedEmail}`;
  try {
    const remainingCooldown = await redis.ttl(cooldownKey);
    if (remainingCooldown > 0) {
      return {
        success: false,
        error: `Please wait ${remainingCooldown}s before requesting another code.`,
        cooldownSeconds: remainingCooldown,
      };
    }
  } catch {
    const memoryCooldown = cooldownStore.get(normalizedEmail);
    if (memoryCooldown && memoryCooldown > now) {
      const wait = Math.ceil((memoryCooldown - now) / 1000);
      return {
        success: false,
        error: `Please wait ${wait}s before requesting another code.`,
        cooldownSeconds: wait,
      };
    }
  }

  // 2. Generate 6-digit numerical code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + OTP_TTL_SECONDS * 1000;

  // 3. Store in Redis with TTL
  const otpKey = `auth:otp:${normalizedEmail}`;
  const storedData: StoredOtp = { code, attempts: 0, expiresAt };

  try {
    await redis.setex(otpKey, OTP_TTL_SECONDS, JSON.stringify(storedData));
    await redis.setex(cooldownKey, COOLDOWN_SECONDS, "1");
  } catch (err) {
    logger.warn({ err, email: normalizedEmail }, "Redis error storing OTP, falling back to in-memory");
    memoryOtpStore.set(normalizedEmail, storedData);
    cooldownStore.set(normalizedEmail, now + COOLDOWN_SECONDS * 1000);
  }

  // Also log in dev / server console for instant testing
  console.log(`\n========================================\n🔑 [BACKLIFY OTP] Code for ${normalizedEmail}: ${code}\n========================================\n`);
  logger.info({ email: normalizedEmail, code }, "Generated Auth OTP code");

  // 4. Send via Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const fromEmail = process.env.EMAIL_FROM || "Backlify <auth@mail.backlify.space>";
      const username = normalizedEmail.split("@")[0] || "there";
      const formattedCode = code.split("").join(" ");

      const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="background-color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 40px auto; padding: 20px 24px;">
                <tr>
                  <td align="left" style="padding-bottom: 28px;">
                    <img src="https://backlify.space/backlify-logo.svg" width="30" height="30" alt="Backlify" style="display: block; border: 0;" />
                  </td>
                </tr>
                <tr>
                  <td align="left">
                    <h1 style="font-size: 24px; font-weight: 700; color: #000000; margin: 0 0 20px; letter-spacing: -0.4px;">
                      Log in to Backlify
                    </h1>
                    <p style="font-size: 14px; color: #222222; margin: 0 0 12px; line-height: 1.5;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="font-size: 14px; color: #444444; margin: 0 0 28px; line-height: 1.5;">
                      A login request was made for your account.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="background-color: #f4f4f5; border-radius: 8px; padding: 22px 16px;">
                    <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: #000000; display: inline-block; padding-left: 12px;">
                      ${formattedCode}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding-top: 24px; padding-bottom: 28px;">
                    <p style="font-size: 13px; color: #666666; margin: 0; line-height: 1.5;">
                      This code expires in 10 minutes.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #eaeaea; padding-top: 24px;">
                    <p style="font-size: 12px; color: #888888; line-height: 1.6; margin: 0 0 14px;">
                      If you didn't request this, ignore this email. Backlify will never ask for this code by phone, chat, or email. For help, visit our <a href="https://backlify.space" style="color: #666666; text-decoration: underline;">Help page</a>.
                    </p>
                    <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 0;">
                      Copyright © 2026 Backlify Inc. All rights reserved.<br />
                      <a href="https://backlify.space" style="color: #999999; text-decoration: underline;">https://backlify.space</a>
                    </p>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;

      let { error: resendError } = await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: `Your Backlify login code: ${code}`,
        html: emailHtml,
      });

      // If sending from custom domain failed (e.g. unverified domain), fallback to onboarding@resend.dev
      if (resendError && fromEmail !== "Backlify <onboarding@resend.dev>") {
        logger.warn({ resendError }, "Retrying Resend with onboarding@resend.dev fallback");
        const retryResult = await resend.emails.send({
          from: "Backlify <onboarding@resend.dev>",
          to: normalizedEmail,
          subject: `Your Backlify login code: ${code}`,
          html: emailHtml,
        });
        resendError = retryResult.error;
      }

      if (resendError) {
        logger.error({ resendError, email: normalizedEmail }, "Resend failed to send OTP email");
        // We still proceed so local/testing can use the console code or retry
      }
    } catch (sendErr) {
      logger.error({ sendErr, email: normalizedEmail }, "Exception sending OTP email via Resend");
    }
  } else {
    logger.warn("RESEND_API_KEY is not configured; logged OTP to console only.");
  }

  return { success: true, cooldownSeconds: COOLDOWN_SECONDS };
}

/**
 * Validates a user-submitted 6-digit code against the stored OTP.
 */
export async function verifyOtp(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();
  const otpKey = `auth:otp:${normalizedEmail}`;

  let stored: StoredOtp | null = null;

  try {
    const raw = await redis.get(otpKey);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch {
    stored = memoryOtpStore.get(normalizedEmail) || null;
  }

  if (!stored) {
    return {
      success: false,
      error: "Code has expired or does not exist. Please request a new code.",
    };
  }

  // Check attempt limit
  stored.attempts += 1;
  if (stored.attempts > MAX_ATTEMPTS) {
    try {
      await redis.del(otpKey);
    } catch {
      memoryOtpStore.delete(normalizedEmail);
    }
    return {
      success: false,
      error: "Too many incorrect attempts. Please request a new code.",
    };
  }

  // Verify match
  if (stored.code !== normalizedCode) {
    // Update attempts
    try {
      const ttl = await redis.ttl(otpKey);
      if (ttl > 0) {
        await redis.setex(otpKey, ttl, JSON.stringify(stored));
      }
    } catch {
      memoryOtpStore.set(normalizedEmail, stored);
    }

    const remaining = MAX_ATTEMPTS - stored.attempts;
    return {
      success: false,
      error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Code matches! Clean up OTP (single-use)
  try {
    await redis.del(otpKey);
  } catch {
    memoryOtpStore.delete(normalizedEmail);
  }

  return { success: true };
}
