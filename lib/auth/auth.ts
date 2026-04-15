import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { organization } from "better-auth/plugins"
import { prisma } from ".././prisma"
import nodemailer from "nodemailer"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      sendEmailUser(
        user.email,
        url,
        token
      );
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Senha do usuario alterada com sucesso:${user.email}`);
    },
  },
  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60 * 24,
    }),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "https://thato.nijpgo.easypanel.host"],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "https://thato.nijpgo.easypanel.host",
})

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmailUser(email: string, url: string, token: string) {
  try {
    const resetLink = `${url}/${token}`;
    await transporter.sendMail({
      from: `"Mass Ticket" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de senha",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Recuperação de senha</h2>
          <p>Você solicitou a alteração da sua senha.</p>
          <p>Clique no botão abaixo para redefinir:</p>

          <a href="${resetLink}" 
             style="display:inline-block;
                    padding:10px 20px;
                    background:#007bff;
                    color:#fff;
                    text-decoration:none;
                    border-radius:5px;">
            Redefinir senha
          </a>

          <p style="margin-top:20px;">
            Ou copie o link abaixo:<br/>
            ${resetLink}
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}