import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  token: string,
  username?: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Default to localhost for development; assume production URL is handled by deployment
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">ایمیل خود را تایید کنید</h2>
        <p>سلام ${username || "دوست عزیز"},</p>
        <p>Thank you for registering!</p>
        <p style="font-size: 14px; color: #555;">لطفا لینک زیر را برای تایید ایمیل خود کلیک کنید</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Verify Email</a>
        </div>
        <p>اگر دکمه کار نکرد لینک زیر را کپی کنید</p>
        <p style="word-break: break-word; color: #555;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This link will expire in 24 hours. If you did not request this email, please ignore it.</p>
        <p style="font-size: 12px; color: #777;">با تشکر فراوان,<br> عاشا</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send verification email");
  }
}
