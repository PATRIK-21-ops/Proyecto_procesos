import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

function extractEmail(rawFrom) {
  const str = String(rawFrom || '').trim();
  const match = str.match(/<([^>]+)>/);
  return match ? match[1].trim() : str;
}

export class EmailService {
  constructor() {
    this.tokenSecret =
      process.env.EMAIL_TOKEN_SECRET ||
      process.env.SESSION_SECRET ||
      'hellfall-default-secret-key';

    // Si en Render está puesto 587 o 465 (bloqueados por Render), forzamos 2525 automáticamente
    const envPort = Number(process.env.SMTP_PORT);
    const smtpPort = !envPort || envPort === 587 || envPort === 465 ? 2525 : envPort;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: smtpPort,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      family: 4, // Fuerza IPv4 para evitar cuelgues de DNS IPv6 en Render
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  createConfirmationToken({ email, passwordHash }) {
    const payload = {
      email,
      passwordHash,
      exp: Date.now() + 24 * 60 * 60 * 1000 // Caduca en 24 horas
    };
    const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(data)
      .digest('base64url');
    return `${data}.${signature}`;
  }

  verifyConfirmationToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) return null;
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(data)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
      if (!payload.exp || Date.now() > payload.exp) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async sendConfirmationEmail({ toEmail, confirmUrl }) {
    const fromEmail = extractEmail(process.env.SMTP_FROM || 'lopespatrik58@gmail.com');
    const apiKeyOrPass = (process.env.BREVO_API_KEY || process.env.SMTP_PASS || '').trim();

    const subject = 'HELLFALL // Confirma tu cuenta de acceso';
    const htmlContent = `
      <div style="font-family: monospace; background-color: #0d0d0d; color: #f5f5f5; padding: 24px; border: 2px solid #ff3b30;">
        <h2 style="color: #ff3b30; margin-top: 0;">HELLFALL // CENTRO DE MANDO</h2>
        <p>Se ha registrado una solicitud de alistamiento para este correo.</p>
        <p>Haz clic en el siguiente enlace para activar tu cuenta y entrar al sector:</p>
        <p style="margin: 24px 0;">
          <a href="${confirmUrl}" style="background-color: #ff3b30; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: bold; display: inline-block;">
            ACTIVAR CUENTA
          </a>
        </p>
        <p style="font-size: 12px; color: #aaaaaa;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${confirmUrl}</p>
      </div>
    `;

    // MODO 1: Si la clave es una API Key v3 de Brevo (xkeysib-...), enviamos por HTTPS (Puerto 443, nunca bloqueado por Render)
    if (apiKeyOrPass.startsWith('xkeysib-')) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKeyOrPass,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'HELLFALL', email: fromEmail },
          to: [{ email: toEmail }],
          subject,
          htmlContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error HTTP API Brevo:', response.status, errorText);
        throw new Error(`Brevo API HTTP ${response.status}`);
      }
      return;
    }

    // MODO 2: Clave SMTP (xsmtpsib-...) forzada por puerto 2525
    try {
      await this.transporter.sendMail({
        from: `"HELLFALL" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error('Error al enviar correo mediante Brevo:', error);
      throw new Error(`SMTP Timeout/Error (${error.code || error.message})`);
    }
  }
}