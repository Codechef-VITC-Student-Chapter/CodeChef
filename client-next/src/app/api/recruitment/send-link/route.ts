import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanityClient";
import { logApiExecution } from "@/lib/logger";

const DEPARTMENT_TITLE_MAP: Record<string, string> = {
  competitive_programming: "Technical (Competitive Programming)",
  projects: "Projects",
  web_development: "Web Development",
  design: "Design",
  management: "Event Management",
  marketing_and_outreach: "Marketing & Outreach",
  social_media_and_content: "Social Media & Content",
  finance: "Finance",
};

// ─── Resend error classification ────────────────────────────────────────────
function classifyResendError(status: number, message: string): string {
  switch (status) {
    case 400: return `Bad Request — invalid payload: ${message}`;
    case 401: return "Unauthorized — RESEND_API_KEY is invalid or missing.";
    case 403: return "Forbidden — The 'from' address uses an unverified domain. Update RESEND_FROM_EMAIL in .env.local to use your verified Resend domain (not resend.dev).";
    case 422: return `Unprocessable — invalid email payload: ${message}`;
    case 429: return "Rate limited by Resend. Please wait before sending more emails.";
    default:  return message || `HTTP ${status} from Resend API`;
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/recruitment/send-link";

  try {
    const { vit_email, department, name } = await req.json();

    // ── Input validation ───────────────────────────────────────────────────
    if (!vit_email || typeof vit_email !== "string") {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Validation: email required");
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // Basic email format guard (VIT domain validated on the client, but re-check server-side)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vit_email)) {
      logApiExecution("POST", pathname, 400, Date.now() - start, `Validation: malformed email ${vit_email}`);
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const deptKey = (department && typeof department === "string") ? department : "general";
    const deptTitle = DEPARTMENT_TITLE_MAP[deptKey] || deptKey;

    // ── 1. Resolve WhatsApp Group Link ─────────────────────────────────────
    // Priority:
    //   a) Sanity CMS recruitmentSheetLinks[dept].url
    //   b) WHATSAPP_LINK_<DEPT_KEY> env var
    //   c) WHATSAPP_GROUP_LINK env var
    //   d) Safe fallback
    let whatsappLink = "";

    try {
      const query = `*[_type == "recruitmentSheetLinks"] | order(_createdAt desc)[0]{whatsAppGroupLinks}`;
      const links = await client.fetch(query);
      if (links?.whatsAppGroupLinks?.[deptKey]?.url) {
        whatsappLink = links.whatsAppGroupLinks[deptKey].url;
      }
    } catch (sanityErr) {
      console.warn("[Sanity] Could not fetch WhatsApp link:", sanityErr);
    }

    if (!whatsappLink) {
      const envDeptKey = `WHATSAPP_LINK_${deptKey.toUpperCase()}`;
      whatsappLink =
        process.env[envDeptKey] ||
        process.env.WHATSAPP_GROUP_LINK ||
        "https://chat.whatsapp.com";
    }

    // ── 2. Resend configuration ────────────────────────────────────────────
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail    = process.env.RESEND_FROM_EMAIL;
    const replyTo      = process.env.RESEND_REPLY_TO;

    if (!resendApiKey) {
      console.warn("[Resend] RESEND_API_KEY is not set — email skipped.");
      logApiExecution("POST", pathname, 200, Date.now() - start,
        `Skipped email (RESEND_API_KEY missing) — WhatsApp link ready for ${deptKey}`);
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Email service is not configured (RESEND_API_KEY missing). WhatsApp link provided below.",
        whatsappLink,
        deptTitle,
      });
    }

    if (!fromEmail) {
      console.warn("[Resend] RESEND_FROM_EMAIL is not set — email skipped.");
      logApiExecution("POST", pathname, 200, Date.now() - start,
        "Skipped email (RESEND_FROM_EMAIL missing)");
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Email sender address is not configured (RESEND_FROM_EMAIL missing). WhatsApp link provided below.",
        whatsappLink,
        deptTitle,
      });
    }

    // Guard against accidentally using the resend.dev testing domain in production
    const isTestingDomain = fromEmail.includes("@resend.dev");
    if (isTestingDomain) {
      console.warn(
        "[Resend] WARNING: RESEND_FROM_EMAIL uses the resend.dev testing domain. " +
        "Emails can only be sent to your own Resend account email. " +
        "To send to applicants, verify a custom domain at https://resend.com/domains " +
        "and update RESEND_FROM_EMAIL in .env.local."
      );
    }

    // ── 3. Responsive HTML Email Template ─────────────────────────────────
    const currentYear = new Date().getFullYear();
    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeChef VITC — WhatsApp Group Invitation</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .wrapper { width: 100%; padding: 32px 16px; background-color: #f3f4f6; }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #000000;
      border-radius: 12px;
      box-shadow: 4px 4px 0px #000000;
      overflow: hidden;
    }
    .header {
      background-color: #1e3a5f;
      border-bottom: 3px solid #000000;
      padding: 28px 24px;
      text-align: center;
    }
    .header-eyebrow {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #93c5fd;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #ffffff;
      text-transform: uppercase;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.65;
      color: #1f2937;
    }
    .dept-badge {
      display: inline-block;
      background-color: #dbeafe;
      color: #1d4ed8;
      border: 1.5px solid #93c5fd;
      padding: 5px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .content h2 {
      margin: 0 0 16px 0;
      font-size: 22px;
      font-weight: 700;
      color: #111827;
    }
    .content p {
      margin: 0 0 14px 0;
      font-size: 15px;
      color: #374151;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn {
      display: inline-block;
      background-color: #25D366;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 36px;
      border-radius: 10px;
      border: 2px solid #000000;
      box-shadow: 3px 3px 0px #000000;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.03em;
    }
    .fallback-link {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      margin-top: 12px;
    }
    .fallback-link a { color: #2563eb; word-break: break-all; }
    .footer {
      border-top: 2px solid #e5e7eb;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      background-color: #f9fafb;
    }
    .footer-links { margin-top: 8px; }
    .footer-links a { color: #3b82f6; text-decoration: underline; margin: 0 6px; }
    @media only screen and (max-width: 480px) {
      .content { padding: 24px 20px; }
      .header { padding: 20px 16px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <span class="header-eyebrow">CodeChef VIT Chennai Chapter</span>
        <h1>Recruitment ${currentYear}</h1>
      </div>

      <div class="content">
        <div class="dept-badge">${deptTitle}</div>
        <h2>Hi ${name ? name.trim() : "there"} 👋</h2>
        <p>
          Thank you for applying to <strong>CodeChef VIT Chennai</strong>! 🎉
          We're thrilled to have you in the applicant pool for <strong>${deptTitle}</strong>.
        </p>
        <p>
          Our team will carefully review your application. Meanwhile, please join our
          official WhatsApp group for <strong>${deptTitle}</strong> to receive timely
          updates on interview schedules, tasks, and announcements.
        </p>

        <div class="divider"></div>

        <div class="btn-container">
          <a href="${whatsappLink}" class="btn" target="_blank" rel="noopener noreferrer">
            📱 Join WhatsApp Group
          </a>
        </div>

        <p class="fallback-link">
          If the button doesn't work, copy this link into your browser:<br>
          <a href="${whatsappLink}">${whatsappLink}</a>
        </p>

        <div class="divider"></div>

        <p style="font-size:13px; color:#6b7280; margin:0;">
          If you have any questions, reply to this email and our recruitment team will get back to you.
        </p>
      </div>

      <div class="footer">
        <p>© ${currentYear} CodeChef VIT Chennai Chapter. All rights reserved.</p>
        <div class="footer-links">
          <a href="https://www.codechefvitc.in" target="_blank">Website</a>
          <a href="https://www.linkedin.com/company/codechef-vit-chennai-chapter/" target="_blank">LinkedIn</a>
          <a href="https://www.instagram.com/codechef.vitc/" target="_blank">Instagram</a>
        </div>
        <p style="margin-top:12px; font-size:11px; color:#9ca3af;">
          You received this email because you submitted a recruitment application to CodeChef VITC.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // ── 4. Build Resend payload ────────────────────────────────────────────
    const resendPayload: Record<string, unknown> = {
      from: fromEmail,
      to: [vit_email],
      subject: `🎉 Welcome to CodeChef VITC — Join Your ${deptTitle} WhatsApp Group`,
      html: emailHtml,
    };
    if (replyTo) resendPayload.reply_to = replyTo;

    // ── 5. Send via Resend REST API ────────────────────────────────────────
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      const errorDetail = classifyResendError(resendResponse.status, resendData?.message || "");
      // Log without exposing the API key or full payload
      console.error(
        `[Resend] HTTP ${resendResponse.status} — sender domain: ${fromEmail.split("@")[1]?.split(">")[0] ?? "unknown"} — ${errorDetail}`
      );
      logApiExecution("POST", pathname, resendResponse.status, Date.now() - start,
        `Resend ${resendResponse.status}: ${errorDetail}`);

      // Surface a human-readable warning (not the raw Resend error) to the client
      let clientWarning = "The email invitation could not be delivered at this time.";
      if (resendResponse.status === 403 && isTestingDomain) {
        clientWarning =
          "Email delivery is currently in test mode and restricted. " +
          "Your WhatsApp group link is available below — please join directly.";
      } else if (resendResponse.status === 403) {
        clientWarning =
          "Email sender domain is not yet verified. " +
          "Your WhatsApp group link is available below.";
      }

      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: clientWarning,
        whatsappLink,
        deptTitle,
      });
    }

    logApiExecution("POST", pathname, 200, Date.now() - start,
      `Resend OK — recipient domain: ${vit_email.split("@")[1]} — id: ${resendData?.id}`);

    return NextResponse.json({
      success: true,
      emailSent: true,
      id: resendData?.id,
      whatsappLink,
      deptTitle,
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Send Link] Unhandled error:", errorMsg);
    logApiExecution("POST", pathname, 500, Date.now() - start, errorMsg);
    return NextResponse.json(
      { error: "Failed to process recruitment link. Please try again." },
      { status: 500 }
    );
  }
}
