import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "36026595a66664",
    pass: "1bb98c3b25b666",
  },
});

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: '"Circle Seed" <hello@demomailtrap.com>',
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};
