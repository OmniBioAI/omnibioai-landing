/**
 * OmniBioAI Beta Registration & Approval Worker
 *
 * Release: v0.8.1-beta
 * Repository: https://github.com/OmniBioAI/omnibioai-studio
 *
 * Required bindings:
 *   BETA_REQUESTS             Cloudflare KV namespace
 *   ADMIN_KEY                 Worker secret
 *   RESEND_API_KEY            Worker secret
 *   LICENSE_SERVER_URL        Worker variable
 *   LICENSE_CLIENT_ID         Worker secret
 *   LICENSE_CLIENT_SECRET     Worker secret
 *
 * IMPORTANT:
 * Confirm the License Server API contract before deployment.
 * No GitHub PAT is distributed to applicants.
 *
 * Desktop apps are under development: DESKTOP_APPS_AVAILABLE = false
 * keeps approval emails Web Studio-only. Approved records carry
 * desktop_notify_pending + desktop_platform so applicants can be
 * emailed when their platform's app ships. Flip the flag (and verify
 * release assets) once desktop builds are published.
 */

const VERSION = "0.8.1-beta";

const GITHUB_REPO =
  "https://github.com/OmniBioAI/omnibioai-studio";

const RELEASES_URL = `${GITHUB_REPO}/releases`;

const RELEASE_TAG = `v${VERSION}`;
const RELEASE_BASE =
  `${GITHUB_REPO}/releases/download/${RELEASE_TAG}`;

// Expected filenames only. Verify published release assets.
const DOWNLOADS = {
  mac:
    `${RELEASE_BASE}/OmniBioAI%20Studio-${VERSION}-arm64.dmg`,
  linux:
    `${RELEASE_BASE}/OmniBioAI%20Studio-${VERSION}.AppImage`,
  windows:
    `${RELEASE_BASE}/OmniBioAI%20Studio%20Setup%20${VERSION}.exe`
};

// Desktop apps (local download) are still under development.
// While false, approval emails offer Web Studio only, never a
// download link, and the applicant's chosen OS is recorded so
// they can be notified when their desktop app ships.
const DESKTOP_APPS_AVAILABLE = false;

// Only used once DESKTOP_APPS_AVAILABLE is true. Until release
// assets are verified, direct users to the release listing
// rather than potentially broken asset URLs.
const USE_DIRECT_DOWNLOADS = false;

const WEB_STUDIO_URL = "https://webstudio.omnibioai.org";
const DOCS_URL = "https://docs.omnibioai.org";

const ADMIN_EMAIL = "manish@omnibioai.org";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const path = new URL(request.url).pathname;

    try {
      // ---------------------------------------------
      // POST /submit
      // ---------------------------------------------
      if (request.method === "POST" && path === "/submit") {
        const data = await request.json();

        if (
          !data ||
          typeof data.email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
        ) {
          return jsonResponse(
            { success: false, error: "Valid email required" },
            400
          );
        }

        const id = crypto.randomUUID();

        const entry = {
          id,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email.trim().toLowerCase(),
          institution: data.institution || "",
          role: data.role || "",
          platform: data.platform || "linux",
          use_case: data.use_case || "",
          research: data.research || "",
          submitted_at: new Date().toISOString(),
          status: "pending"
        };

        await env.BETA_REQUESTS.put(
          id,
          JSON.stringify(entry)
        );

        try {
          await sendEmail({
            to: ADMIN_EMAIL,
            subject: "New OmniBioAI Studio Beta Request",
            body: `New beta access request:

Name: ${entry.first_name} ${entry.last_name}
Email: ${entry.email}
Institution: ${entry.institution}
Role: ${entry.role}
Desktop OS (for when desktop apps ship): ${entry.platform}
Use Case: ${entry.use_case}
Research: ${entry.research}

Review at:
https://omnibioai.org/admin.html`
          }, env);
        } catch {
          console.error("Admin notification failed");
        }

        return jsonResponse({
          success: true,
          id
        });
      }

      // ---------------------------------------------
      // GET /admin/requests
      // ---------------------------------------------
      if (
        request.method === "GET" &&
        path === "/admin/requests"
      ) {
        if (!checkAuth(request, env)) {
          return jsonResponse(
            { error: "Unauthorized" },
            401
          );
        }

        const requests = [];
        let cursor;

        do {
          const page = await env.BETA_REQUESTS.list({
            limit: 1000,
            ...(cursor ? { cursor } : {})
          });

          const records = await Promise.all(
            page.keys.map(async (key) => {
              const raw = await env.BETA_REQUESTS.get(key.name);
              return raw ? JSON.parse(raw) : null;
            })
          );

          requests.push(...records.filter(Boolean));

          cursor = page.list_complete
            ? undefined
            : page.cursor;

        } while (cursor);

        requests.sort(
          (a, b) =>
            new Date(b.submitted_at) -
            new Date(a.submitted_at)
        );

        return jsonResponse(requests);
      }

      // ---------------------------------------------
      // PATCH /admin/requests/:id
      // ---------------------------------------------
      if (
        request.method === "PATCH" &&
        path.startsWith("/admin/requests/")
      ) {
        if (!checkAuth(request, env)) {
          return jsonResponse(
            { error: "Unauthorized" },
            401
          );
        }

        const id = path.split("/").pop();
        const raw = await env.BETA_REQUESTS.get(id);

        if (!raw) {
          return jsonResponse(
            { error: "Request not found" },
            404
          );
        }

        const existing = JSON.parse(raw);
        const update = await request.json();

        if (
          !update ||
          !["approved", "rejected"].includes(update.status)
        ) {
          return jsonResponse(
            { error: "Invalid status" },
            400
          );
        }

        if (existing.status !== "pending") {
          return jsonResponse({
            success: false,
            error: "Request already processed",
            status: existing.status
          }, 409);
        }

        // -------------------------------------------
        // APPROVE
        // -------------------------------------------
        if (update.status === "approved") {
          const platform = normalizePlatform(
            existing.platform
          );

          // The License Server must be authoritative.
          // Do not independently derive another key.
          const license = await registerLicense(
            existing.email,
            30,
            id,
            env
          );

          if (!license.success) {
            return jsonResponse({
              success: false,
              error: "License issuance failed",
              detail: license.reason
            }, 502);
          }

          const emailBody = buildApprovalEmail({
            existing,
            platform,
            licenseKey: license.key,
            expiresAt: license.expiresAt,
            note: update.note
          });

          try {
            await sendEmail({
              to: existing.email,
              subject: "Your OmniBioAI Studio Beta Access is Approved",
              body: emailBody
            }, env);
          } catch {
            // The key now exists in the license server but never reached
            // the applicant. Leave the request pending so it can be retried,
            // and record the attempt so the orphaned key can be revoked.
            await env.BETA_REQUESTS.put(
              id,
              JSON.stringify({
                ...existing,
                license_attempted_at: new Date().toISOString(),
                last_error: "approval_email_failed"
              })
            );
            return jsonResponse({
              success: false,
              error:
                "License issued but the approval email failed. " +
                "Revoke the unused key for this email, then retry."
            }, 502);
          }

          await env.BETA_REQUESTS.put(
            id,
            JSON.stringify({
              ...existing,
              status: "approved",
              approved_version: VERSION,
              license_issued: true,
              // Lets you find everyone to email when their desktop app ships.
              desktop_notify_pending: !DESKTOP_APPS_AVAILABLE,
              desktop_platform: platform,
              updated_at: new Date().toISOString()
            })
          );

          return jsonResponse({
            success: true,
            status: "approved",
            version: VERSION,
            email_sent: true
          });
        }

        // -------------------------------------------
        // REJECT
        // -------------------------------------------
        await sendEmail({
          to: existing.email,
          subject:
            "OmniBioAI Beta Access — Update on Your Request",
          body: `Hi ${existing.first_name || "Researcher"},

Thank you for your interest in OmniBioAI Studio.

After review, we are unable to provide beta
access at this time.

You are welcome to reapply:
https://omnibioai.org/#request

If you have questions:
${ADMIN_EMAIL}

Best regards,
OmniBioAI Team`
        }, env);

        await env.BETA_REQUESTS.put(
          id,
          JSON.stringify({
            ...existing,
            status: "rejected",
            updated_at: new Date().toISOString()
          })
        );

        return jsonResponse({
          success: true,
          status: "rejected"
        });
      }

      return jsonResponse(
        { error: "Not found" },
        404
      );

    } catch (error) {
      console.error(
        "Worker request failed:",
        error?.name || "UnknownError"
      );

      return jsonResponse({
        success: false,
        error: "Operation could not be completed"
      }, 500);
    }
  }
};

// ---------------------------------------------
// Platform helpers
// ---------------------------------------------

function normalizePlatform(platform) {
  const value = String(platform || "").toLowerCase();

  if (["mac", "macos", "darwin"].includes(value)) {
    return "mac";
  }

  if (["windows", "win"].includes(value)) {
    return "windows";
  }

  return "linux";
}

// ---------------------------------------------
// Approval email
// ---------------------------------------------

function buildApprovalEmail({
  existing,
  platform,
  licenseKey,
  expiresAt,
  note
}) {
  const expiryLine = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
      })
    : "30 days from today";

  const platformLabels = {
    mac: "macOS (Apple Silicon)",
    linux: "Linux",
    windows: "Windows"
  };

  const installInstructions = {
    mac: `1. Download the macOS DMG.
2. Open the downloaded DMG.
3. Drag OmniBioAI Studio into Applications.
4. Launch OmniBioAI Studio.
5. Enter your license key when prompted.`,

    linux: `1. Download the Linux AppImage.
2. Make the downloaded AppImage executable.
3. Launch OmniBioAI Studio.
4. Enter your license key when prompted.`,

    windows: `1. Download the Windows installer.
2. Run the installer.
3. Complete the setup wizard.
4. Launch OmniBioAI Studio.
5. Enter your license key when prompted.`
  };

  const downloadLink = USE_DIRECT_DOWNLOADS
    ? DOWNLOADS[platform]
    : RELEASES_URL;

  const otherDownloads = USE_DIRECT_DOWNLOADS
    ? `macOS: ${DOWNLOADS.mac}
Linux: ${DOWNLOADS.linux}
Windows: ${DOWNLOADS.windows}`
    : "";

  const desktopSection = DESKTOP_APPS_AVAILABLE
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION B: INSTALL THE DESKTOP APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Version:   v${VERSION}
Platform:  ${platformLabels[platform]}

Download:
${downloadLink}
${otherDownloads ? `\nOther platforms:\n${otherDownloads}\n` : ""}
Pick the v${VERSION} release and the installer for
your operating system.

${installInstructions[platform]}

On first launch, the app downloads the platform
components it needs and starts its local services.
This can take a while on the first run.

`
    : `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESKTOP APP: COMING SOON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The desktop app for ${platformLabels[platform]} is still
in development, so there is nothing to download or
install yet. Everything in the beta runs in your
browser through Web Studio above.

We'll email you at ${existing.email} as soon as the
${platformLabels[platform]} app is ready. Your license key
will work there too.

`;

  const accessHeading = DESKTOP_APPS_AVAILABLE
    ? "OPTION A: START IN YOUR BROWSER (fastest)"
    : "GET STARTED IN YOUR BROWSER";

  const releasesLine = DESKTOP_APPS_AVAILABLE
    ? `\nReleases:         ${RELEASES_URL}`
    : "";

  return `Hi ${existing.first_name || "Researcher"},

Your OmniBioAI Studio beta access has been approved.
Welcome to OmniBioAI!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR LICENSE KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${licenseKey}

Registered email:  ${existing.email}
Plan:              Beta (30-day trial)
Valid until:       ${expiryLine}

Treat this key like a password. It activates your beta
license and is tied to the email above, so don't share
or post it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${accessHeading}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open ${WEB_STUDIO_URL}
2. Choose "License Activation".
3. Enter ${existing.email} and your license key.
4. Click "Activate License".
5. Go back to the sign-in screen and choose Google,
   GitHub or Microsoft.
6. Sign in with an account whose verified email is
   exactly ${existing.email}.

Activation does not sign you in or create a password.
You sign in with one of the providers above. No
installation needed.

${desktopSection}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN EXPLORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• RNA-seq and single-cell analysis
• Genomics and proteomics tools
• Workflow execution and management
• AI-assisted biomedical research
• Biological knowledge discovery
• HPC integrations (where supported)

Available features depend on your version, enabled
services and trial plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF SOMETHING GOES WRONG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• "Invalid license key" or email mismatch: copy the key
  exactly and use the registered email shown above.
• "The requested item could not be found.": refresh the
  page (Ctrl+Shift+R / Cmd+Shift+R) and try again.
• Activated but can't sign in: the provider account must
  use the same email as your license. A different email
  is rejected as unapproved or signs you in to a
  different existing account without this license.
• No Google, GitHub or Microsoft account for this email:
  reply to this message and we'll help you get in.
• Your key expires on the date shown above.

Troubleshooting guide:
${DOCS_URL}/troubleshooting/license-and-sign-in/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Web Studio:       ${WEB_STUDIO_URL}
Documentation:    ${DOCS_URL}
Video tutorials:  https://videos.omnibioai.org${releasesLine}
Support:          ${ADMIN_EMAIL}

${note ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A NOTE FROM THE TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${note}

` : ""}We'd love to hear what you build. Just reply to
this email with feedback or questions.

Best regards,

Manish Kumar
Creator, OmniBioAI
${ADMIN_EMAIL}
https://omnibioai.org`;
}

// ---------------------------------------------
// Authoritative license issuance
// ---------------------------------------------

async function registerLicense(email, days, requestId, env) {
  if (!env.LICENSE_SERVER_URL) {
    return {
      success: false,
      reason: "License Server URL is not configured"
    };
  }

  if (!env.LICENSE_CLIENT_ID || !env.LICENSE_CLIENT_SECRET) {
    return {
      success: false,
      reason: "License Server OAuth credentials are missing"
    };
  }

  if (
    typeof requestId !== "string" ||
    requestId.length < 16 ||
    requestId.length > 128
  ) {
    return {
      success: false,
      reason: "Request id is invalid for idempotent license issuance"
    };
  }

  try {
    const baseUrl = new URL(env.LICENSE_SERVER_URL);
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/`;

    const tokenUrl = new URL(
      "oauth/token",
      baseUrl
    );

    if (tokenUrl.protocol !== "https:") {
      return {
        success: false,
        reason: "License Server must use HTTPS"
      };
    }

    const tokenBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.LICENSE_CLIENT_ID,
      client_secret: env.LICENSE_CLIENT_SECRET,
      scope: "license.issue"
    });

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: tokenBody.toString()
    });

    if (!tokenResponse.ok) {
      return {
        success: false,
        reason: await responseFailureDetail(
          tokenResponse,
          "OAuth token endpoint",
          [
            env.LICENSE_CLIENT_ID,
            env.LICENSE_CLIENT_SECRET
          ]
        )
      };
    }

    const tokenResult = await tokenResponse.json();
    if (
      typeof tokenResult.access_token !== "string" ||
      !tokenResult.access_token
    ) {
      return {
        success: false,
        reason: "OAuth token response contract mismatch"
      };
    }

    const url = new URL(
      "license/generate",
      baseUrl
    );

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization":
          `Bearer ${tokenResult.access_token}`,
        "Idempotency-Key": requestId
      },
      // Matches omnibioai-auth LicenseGenerateRequest.
      // platform "both" so the key works in Web Studio and desktop.
      body: JSON.stringify({
        email,
        plan: "beta",
        platform: "both",
        expires_days: days,
        max_uses: 1
      })
    });

    if (!response.ok) {
      return {
        success: false,
        reason: await responseFailureDetail(
          response,
          "License Server",
          [
            env.LICENSE_CLIENT_ID,
            env.LICENSE_CLIENT_SECRET,
            tokenResult.access_token
          ]
        )
      };
    }

    const result = await response.json();

    // omnibioai-auth LicenseGenerateResponse:
    // { key, email, plan, platform, expires_at, max_uses }
    const licenseKey = result.key;

    if (
      typeof licenseKey !== "string" ||
      typeof result.email !== "string" ||
      result.email.toLowerCase() !== email.toLowerCase() ||
      !/^OMNI-[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/.test(
        licenseKey
      )
    ) {
      return {
        success: false,
        reason: "License Server response contract mismatch"
      };
    }

    return {
      success: true,
      key: licenseKey,
      expiresAt: result.expires_at || null
    };

  } catch {
    return {
      success: false,
      reason: "License Server unavailable"
    };
  }
}

async function responseFailureDetail(
  response,
  service,
  sensitiveValues = []
) {
  let detail;

  try {
    const body = await response.json();
    detail = body?.detail;
  } catch {
    // Fall back to the status-only message below.
  }

  if (detail && typeof detail === "object") {
    detail = JSON.stringify(detail);
  }

  let sanitized = detail ? String(detail) : "";

  for (const value of sensitiveValues) {
    if (!value) continue;
    sanitized = sanitized
      .replaceAll(String(value), "[REDACTED]")
      .replaceAll(
        encodeURIComponent(String(value)),
        "[REDACTED]"
      );
  }

  sanitized = sanitized
    .replace(
      /\bBearer\s+[^\s"']+/gi,
      "Bearer [REDACTED]"
    )
    .replace(
      /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      "[REDACTED]"
    );

  return sanitized
    ? `${service} returned HTTP ${response.status}: ${sanitized}`
    : `${service} returned HTTP ${response.status}`;
}

// ---------------------------------------------
// Admin authentication
// ---------------------------------------------

function checkAuth(request, env) {
  if (!env.ADMIN_KEY) {
    return false;
  }

  const supplied = request.headers.get("X-Admin-Key");

  return Boolean(
    supplied &&
    supplied === env.ADMIN_KEY
  );
}

// ---------------------------------------------
// JSON response
// ---------------------------------------------

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS
    }
  });
}

// ---------------------------------------------
// Resend email delivery
// ---------------------------------------------

async function sendEmail({
  to,
  from = ADMIN_EMAIL,
  subject,
  body
}, env) {
  if (!env.RESEND_API_KEY) {
    throw new Error("Resend API key is missing");
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `OmniBioAI <${from}>`,
        to: [to],
        subject,
        text: body
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Email delivery failed: HTTP ${response.status}`
    );
  }

  return response;
}
