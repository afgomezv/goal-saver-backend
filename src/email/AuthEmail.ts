import { transport } from "../config/nodemailer";

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "LoadSaver <admin@loadsaver.com>",
      to: user.email,
      subject: "Confirm your account load Saver",
      html: `
       <p>Hola ${user.name} has creado tu cuenta en LoadSaver, ya esta casi lista</p>
       <p>Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
       <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
       <p>Ingresa el codigo: <b>${user.token}</b></p>
      `,
    });
  };

  static sendPasswordResetToken = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "LoadSaver <admin@loadsaver.com>",
      to: user.email,
      subject: "Confirm your reset password",
      html: `
       <p>Hola ${user.name} has creado solicitado reestablecer tu contraseña </p>
       <p>Para reestablecer tu contraseña, haz click en el siguiente enlace:</p>
       <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
       <p>Ingresa el codigo: <b>${user.token}</b></p>
      `,
    });

    console.log("Mensaje Enviado", email.messageId);
  };
}
