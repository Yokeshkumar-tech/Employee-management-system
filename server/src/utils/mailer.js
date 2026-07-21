import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP credentials not found. Email not sent to:', to);
      return false;
    }

    const textContent = htmlContent.replace(/<[^>]*>?/gm, '');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"HRMS System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });

    console.log('✅ Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return false;
  }
};
