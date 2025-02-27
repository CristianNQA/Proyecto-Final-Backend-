import nodemailer from "nodemailer";
import ENVIRONMENT from "../config/environment.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENVIRONMENT.EMAIL_USERNAME,
    pass: ENVIRONMENT.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${ENVIRONMENT.URL_BACKEND}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: ENVIRONMENT.EMAIL_USER,
    to: email,
    subject: "Verifica tu cuenta",
    html: `<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
            <a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

