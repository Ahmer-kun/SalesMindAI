/**
 * emailUtils.js
 * Path: server/utils/emailUtils.js
 *
 * Nodemailer helper for sending transactional emails.
 * Uses Gmail SMTP with App Password from .env
 */

const nodemailer = require("nodemailer");

// ─── Create transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Send password reset email ────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SalesMind AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your SalesMind AI password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'DM Sans', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header -->
          <div style="background: #4F46E5; padding: 32px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; background: white; border-radius: 8px; display: inline-block;"></div>
              <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SalesMind AI</span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">
              Reset your password
            </h2>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
              Hi ${userName}, we received a request to reset your password. Click the button below to set a new one.
            </p>

            <a href="${resetUrl}"
              style="display: block; background: #4F46E5; color: white; text-align: center;
                     padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
                     text-decoration: none; margin-bottom: 24px;">
              Reset password
            </a>

            <div style="background: #f9fafb; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px;">
                Or copy this link into your browser:
              </p>
              <p style="font-size: 12px; color: #4F46E5; word-break: break-all; margin: 0;">
                ${resetUrl}
              </p>
            </div>

            <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.6;">
              This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="font-size: 11px; color: #d1d5db; margin: 0;">
              © ${new Date().getFullYear()} SalesMind AI. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Send email verification email ───────────────────────────────────────────
const sendVerificationEmail = async (toEmail, verifyToken, userName) => {
  const transporter = createTransporter();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

  const mailOptions = {
    from: `"SalesMind AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your SalesMind AI email",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #4F46E5; padding: 32px; text-align: center;">
            <span style="color: white; font-size: 20px; font-weight: 700;">SalesMind AI</span>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">
              Verify your email address
            </h2>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
              Hi ${userName}, click the button below to verify your email and activate all features.
            </p>
            <a href="${verifyUrl}"
              style="display: block; background: #4F46E5; color: white; text-align: center;
                     padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
                     text-decoration: none; margin-bottom: 24px;">
              Verify email address
            </a>
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This link expires in <strong>24 hours</strong>. If you didn't create a SalesMind AI account, ignore this email.
            </p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="font-size: 11px; color: #d1d5db; margin: 0;">
              © ${new Date().getFullYear()} SalesMind AI
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Send MFA OTP email ───────────────────────────────────────────────────────
const sendOTPEmail = async (toEmail, otp, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"SalesMind AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your SalesMind AI login code`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #4F46E5; padding: 32px; text-align: center;">
            <span style="color: white; font-size: 20px; font-weight: 700;">SalesMind AI</span>
          </div>
          <div style="padding: 32px; text-align: center;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">
              Your login code
            </h2>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">
              Hi ${userName}, use this code to complete your sign in.
            </p>
            <div style="background: #f3f4f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
              <p style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #4F46E5; margin: 0; font-family: monospace;">
                ${otp}
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This code expires in <strong>10 minutes</strong>. Never share this code with anyone.
            </p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="font-size: 11px; color: #d1d5db; margin: 0;">
              © ${new Date().getFullYear()} SalesMind AI
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendVerificationEmail, sendOTPEmail };
