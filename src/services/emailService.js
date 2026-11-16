import nodemailer from 'nodemailer';

export class EmailService {
 constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: 587, 
      secure: false, // <-- ESTO ES LO QUE HACE QUE BREVO FUNCIONE EN EL PUERTO 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationEmail({ toEmail, confirmUrl }) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@hellfall.net',
      to: toEmail,
      subject: 'HELLFALL // Confirma tu cuenta de recluta',
      html: `
        <div style="background-color: #120d10; color: #f8f9fa; padding: 20px; font-family: monospace;">
          <h2 style="color: #ff4d00;">HELLFALL // INFERNAL SIEGE</h2>
          <p>Has solicitado el alta como recluta en la UAC.</p>
          <p>Haz clic en el siguiente enlace para activar tu cuenta y acceder al frente:</p>
          <a href="${confirmUrl}" style="background-color: #ff4d00; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px;">ACTIVAR CUENTA</a>
          <p style="margin-top: 20px; color: #8d99ae; font-size: 0.8rem;">Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar correo mediante Brevo:', error);
      throw new Error('No se pudo enviar el correo de confirmación.');
    }
  }

  createConfirmationToken(payload) {
    // Generamos el token usando Buffer directamente
    const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return tokenData;
  }

  verifyConfirmationToken(token) {
    try {
      const jsonStr = Buffer.from(token, 'base64url').toString('utf8');
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }
}