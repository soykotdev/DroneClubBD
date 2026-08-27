import nodemailer, { type Transporter } from "nodemailer";
import { env, isSmtpConfigured } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (!isSmtpConfigured) return undefined;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends email when SMTP is configured; otherwise logs and no-ops so the rest
 * of the request flow (form submission, admin notification) never fails
 * just because email hasn't been set up yet in development.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.info({ to, subject }, "[email] SMTP not configured — skipping send");
    return;
  }

  await transport.sendMail({ from: env.EMAIL_FROM || env.SMTP_USER, to, subject, html });
}

export function inspectionRequestConfirmationEmail(referenceNumber: string, fullName: string): string {
  return `
    <p>Hello ${escapeHtml(fullName)},</p>
    <p>Thank you for your inspection request to Drone Club Bangladesh. Your reference number is
    <strong>${escapeHtml(referenceNumber)}</strong>. Our team will review your request and get back to you.</p>
    <p>— Drone Club Bangladesh</p>
  `;
}

export function inspectionRequestAdminNotificationEmail(referenceNumber: string, service: string): string {
  return `
    <p>New inspection request received.</p>
    <p>Reference: <strong>${escapeHtml(referenceNumber)}</strong><br/>Service: ${escapeHtml(service)}</p>
    <p>View it in the admin panel under Leads.</p>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
