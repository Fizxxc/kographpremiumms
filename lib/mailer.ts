import nodemailer from "nodemailer";

type MailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP belum dikonfigurasi. Isi SMTP_HOST, SMTP_PORT, SMTP_USER, dan SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

export async function sendMail({ to, subject, html, text, attachments = [] }: SendMailInput) {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "Kograph Premium";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromEmail) {
    throw new Error("SMTP_FROM_EMAIL atau SMTP_USER wajib diisi.");
  }

  return transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    text,
    attachments
  });
}
