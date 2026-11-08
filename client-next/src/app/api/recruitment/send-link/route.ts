import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { client } from "@/lib/sanityClient";
import { logApiExecution } from "@/lib/logger";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/recruitment/send-link";

  try {
    const { vit_email, department, name } = await req.json();

    if (!vit_email) {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Validation: Email required");
      return NextResponse.json({ error: "Please Provide Email" }, { status: 400 });
    }

    const query = `*[_type == "recruitmentSheetLinks"] | order(_createdAt desc)[0]`;
    const links = await client.fetch(query);

    if (!links) {
      return NextResponse.json({ error: "No links found in Sanity" }, { status: 404 });
    }

    const keys = Object.keys(links.whatsAppGroupLinks || {});
    const whatsAppGroupLinks: Record<string, string> = {};
    for (const key of keys) {
      whatsAppGroupLinks[key] = links.whatsAppGroupLinks[key]?.url || "";
    }

    if (!whatsAppGroupLinks[department]) {
      return NextResponse.json({
        error: "Invalid department or no WhatsApp group link configured",
        givenDept: department
      }, { status: 400 });
    }

    const mailOptions = {
      from: `"CodeChef VITC" <${smtpUser}>`,
      to: vit_email,
      subject: "Join Our WhatsApp Group - CodeChef VITC",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #e0fbfc;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .header {
                    text-align: center;
                    background-color: #3d5a80;
                    border-radius: 10px;
                    color: white;
                    padding: 10px 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content p {
                    color: #555555;
                    text-align: left;
                    line-height: 1.4;
                }
                .join-btn {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 10px 20px;
                    background-color: #28a745;
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    color: #777777;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
                .social-media {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                .social-icon {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                }
                .social-icon img {
                    width: 100%;
                    height: 100%;
                    display: block;
                    border-radius: 50%;
                    transition: transform 0.3s ease;
                }
                .social-icon:hover img {
                    transform: scale(1.1);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌟 Join Our Vibrant Community!</h1>
                </div>
                <div class="content">
                    <h2>Welcome to CodeChef!</h2>
                    <p>Thank you ${name} for filling out our recruitment form. At CodeChef, we're all about innovation, passion, and camaraderie. Whether you're a first-year explorer or a seasoned senior, our doors are open to everyone who's eager to dive into the world of Competitive Programming. We're excited to introduce you to our various departments and sub-departments, where you can find your niche and contribute to meaningful projects.</p>
                    <p>Click the button below to join our WhatsApp group and stay updated with our latest activities and announcements regarding recruitment.</p>
                    <a href="${whatsAppGroupLinks[department]}" class="join-btn" style="color: white; font-weight: bold; text-decoration: none;">Join WhatsApp Group</a>
                </div>
                <div class="footer">
                    <p>Follow us on social media:</p>
                    <div class="social-media">
                        <a href="https://www.linkedin.com/company/codechef-vit-chennai-chapter/" target="_blank" class="social-icon">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn">
                        </a>
                        <a href="https://www.instagram.com/codechef.vitc/" target="_blank" class="social-icon">
                            <img src="https://res.cloudinary.com/dxu5hlgvd/image/upload/v1720083181/instagram_mqplcc.png" alt="Instagram">
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Nodemailer sendMail failed:", error);
          reject(error);
        } else {
          console.log("Email sent successfully:", info.response);
          resolve();
        }
      });
    });

    logApiExecution("POST", pathname, 200, Date.now() - start, `Email sent to ${department}`);
    return NextResponse.json({ message: "email sent Successfully" });
  } catch (error: any) {
    console.error("Error in send-link api route:", error);
    logApiExecution("POST", pathname, 500, Date.now() - start, error.message);
    return NextResponse.json({ error: "Failed to send email link", details: error.message }, { status: 500 });
  }
}
