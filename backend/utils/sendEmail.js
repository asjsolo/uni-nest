import nodemailer from 'nodemailer';

/**
 * Sends an email using nodemailer with Gmail (or any SMTP) transport.
 * Uses env vars: EMAIL_USER, EMAIL_PASS (App Password if Gmail).
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"UniNest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
