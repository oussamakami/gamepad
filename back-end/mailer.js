import Dotenv from 'dotenv';
import nodemailer from 'nodemailer';

Dotenv.config();
const SMTP = process.env.SMTP;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

class Mailer {
    static transporter = nodemailer.createTransport({
        host: SMTP,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    static generateRecoveryEmail(resetLink) {
        const template = `
            <body style="background:#FAFBFE;color:#6C757D;text-align:center;font-family:Arial, sans-serif;padding:60px;">
                <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:5px;padding:16px;box-shadow:0 0 35px #9aa1ab26;">
                    <h1 style="margin:0 0 16px;font-weight:900;">GamePad</h1>
                    <h2 style="margin:0 0 16px">Password Reset Request</h2>
                    <p style="font-size:14px;margin:0 0 16px;padding:0 20px">We received a password reset request. Click below to proceed:</p>
                    <a href="${resetLink}" style="display:block;background:#727cf5;color:#fff;text-decoration:none;padding:11px 15px;border-radius:5px;margin:0 64px 16px;font-size:15px">Reset Password</a>
                    <p style="font-size:14px;margin:0 0 8px;padding:0 20px">If you didn't request this, please ignore this email.</p>
                    <p style="font-size:10px;margin:0;padding:0 20px">This link expires in 1 hour.</p>
                </div>
            </body>`;
        return (template);
    }

    static generateTwoFAEmail(code) {
        const template = `
            <body style="background:#FAFBFE;color:#6C757D;text-align:center;font-family:Arial, sans-serif;padding:60px;">
                <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:5px;padding:16px;box-shadow:0 0 35px #9aa1ab26;">
                    <h1 style="margin:0 0 16px;font-weight:900;">GamePad</h1>
                    <h2 style="margin:0 0 16px">Your Two-Factor Authentication Code</h2>
                    <p style="font-size:14px;margin:0 0 16px;padding:0 20px">We received a password reset request. Click below to proceed:</p>
                    <h3 style="color:#727cf5; font-size: 40px; font-weight: 900; letter-spacing: 2px; margin: 20px 0;">${code}</h3>
                    <p style="font-size:14px;margin:0 0 8px;padding:0 20px">If you didn't request this, please secure your account immediately.</p>
                    <p style="font-size:10px;margin:0;padding:0 20px">This code expires in 15 minutes.</p>
                </div>
            </body>`;
        return (template);
    }

    static async sendRecoveryEmail(toEmail, resetLink) {
        try {
            const mailOptions = {
                from: `GamePad`,
                to: toEmail,
                subject: 'Password Reset Request',
                html: this.generateRecoveryEmail(resetLink)
            };

            await this.transporter.sendMail(mailOptions);
            return (true);
        } catch {
            return (false);
        }
    }

    static async sendTwoFAEmail(toEmail, code) {
        try {
            const mailOptions = {
                from: `GamePad`,
                to: toEmail,
                subject: 'Your Two-Factor Authentication Code',
                html: this.generateTwoFAEmail(code)
            };

            await this.transporter.sendMail(mailOptions);
            return (true);
        } catch {
            return (false);
        }
    }
}

export default Mailer;