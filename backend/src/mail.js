import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, 'templates');

function renderTemplate(name, vars) {
  let html = fs.readFileSync(path.join(templatesDir, name), 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, String(value));
  }
  return html;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mail] SMTP_USER/SMTP_PASS not set — skipping real email send.');
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"BidBazaar" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendSmsOtp({ phone, otp }) {
  if (!phone) return;
  const apiKey = process.env.FAST2SMS_KEY;
  if (!apiKey) {
    console.log(`[SMS OTP] ${phone}: ${otp} (FAST2SMS_KEY not set — skipping SMS)`);
    return;
  }
  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: 'otp',
        variables_values: String(otp),
        numbers: phone.replace(/\D/g, '').slice(-10),
      }),
    });
    const data = await res.json();
    if (data.return) console.log(`[SMS] OTP sent to ${phone}`);
    else console.warn('[SMS] Failed:', data.message);
  } catch (e) {
    console.warn('[SMS] Error:', e.message);
  }
}

export async function sendOtpEmail({ to, username, otp }) {
  const html = renderTemplate('otp_mail.html', { username, otp });
  console.log(`[OTP] ${username} <${to}>: ${otp}`);
  await sendMail({ to, subject: 'Your BidBazaar OTP Code', html });
}

export async function sendForgotPasswordOtp({ to, username, otp }) {
  const html = renderTemplate('forgot_password_mail.html', { username, otp });
  console.log(`[Password OTP] ${username} <${to}>: ${otp}`);
  await sendMail({ to, subject: 'BidBazaar — Password Reset OTP', html });
}

export async function sendNewPasswordEmail({ to, username, password }) {
  const html = renderTemplate('new_password_mail.html', { username, password });
  console.log(`[New password] ${username} <${to}>: ${password}`);
  await sendMail({ to, subject: 'BidBazaar — Your New Password', html });
}
