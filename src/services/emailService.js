import nodemailer from 'nodemailer';

export class EmailService {
  constructor(config = process.env) {
    this.appUrl = (config.APP_URL || 'http://localhost:8080').replace(/\/$/, '');
    this.from = config.SMTP_FROM || config.SMTP_USER || 'no-reply@hellfall.local';
    this.enabled = Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS);

    if (this.enabled) {
      const port = Number(config.SMTP_PORT || 465);
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        }
      });
    } else {
      this.transporter = null;
    }
  }

  async sendVerificationEmail(toEmail, rawToken) {
    const verifyUrl = `${this.appUrl}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

    // Modo desarrollo / tests sin SMTP configurado
    if (!this.enabled || !this.transporter) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`\n[EMAIL SIMULADO] Para: ${toEmail}\nEnlace de activación: ${verifyUrl}\n`);
      }
      return { simulated: true, verifyUrl };
    }

    const html = `
      <div style="background:#0c0405;color:#f5ebe6;font-family:monospace;padding:24px;border:2px solid #ff4d00;max-width:520px;">
        <h2 style="color:#ffbe0b;margin-top:0;">HELLFALL // ACTIVACIÓN DE AGENTE UAC</h2>
        <p>Se ha registrado una solicitud de alta para <strong>${toEmail}</strong>.</p>
        <p>Pulsa el siguiente botón para verificar tu correo electrónico y activar tu cuenta (el enlace caduca en 24 horas):</p>
        <p style="margin:24px 0;">
          <a href="${verifyUrl}" style="background:#d90429;color:#fff3b0;padding:12px 20px;text-decoration:none;font-weight:bold;border:1px solid #ffbe0b;display:inline-block;">
            ▶ ACTIVAR CUENTA UAC
          </a>
        </p>
        <p style="font-size:12px;color:#a89088;">Si no has solicitado este registro, ignora este mensaje.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: toEmail,
      subject: 'HELLFALL // Confirma tu correo para activar tu cuenta',
      text: `Activa tu cuenta de HELLFALL abriendo este enlace (válido 24h): ${verifyUrl}`,
      html
    });

    return { simulated: false };
  }
}