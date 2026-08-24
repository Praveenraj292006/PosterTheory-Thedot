import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
} as any);

// Sanitize values before logging to prevent log injection
const sanitizeForLog = (val: string): string => val.replace(/[\n\r\t]/g, '').slice(0, 100);

export const sendOtpEmail = async (to: string, otp: string, name: string, type: 'signup' | 'reset' = 'signup') => {
  console.log(`[OTP] ${type.toUpperCase()} code for ${sanitizeForLog(to)}: ${sanitizeForLog(otp)}`);

  const subject = type === 'reset' ? 'Reset your password - Poster Theory' : 'Verify your email - Poster Theory';
  const heading = type === 'reset' ? `Hey ${name},<br/>Reset your password` : `Hey ${name},`;
  const description = type === 'reset' ? 'Here\'s your password reset code:' : 'Here\'s your verification code:';

  const mailOptions = {
    from: `"Poster Theory" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: `
      <div style="font-family: monospace; max-width: 480px; margin: 0 auto; padding: 40px; border: 2px solid #000;">
        <h1 style="font-size: 24px; text-transform: uppercase; letter-spacing: -1px;">${heading}</h1>
        <p style="font-size: 14px; color: #666; text-transform: uppercase;">${description}</p>
        <div style="background: #000; color: #fff; padding: 20px; text-align: center; margin: 20px 0; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
          ${otp}
        </div>
        <p style="font-size: 11px; color: #999; text-transform: uppercase;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <hr style="border: 1px dashed #ccc; margin: 20px 0;" />
        <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">POSTER THEORY // THE ARCHIVE</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`[MAILER] Failed to send email to ${sanitizeForLog(to)}:`, (err as any).code || err);
    // Don't throw — signup should still succeed, OTP is logged above
  }
};
