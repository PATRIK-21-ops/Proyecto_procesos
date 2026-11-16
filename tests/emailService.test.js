import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { EmailService } from '../src/services/emailService.js';

describe('EmailService — tokens y enlaces de confirmación', () => {
  it('genera un token aleatorio, su hash SHA-256 y una caducidad futura', () => {
    const service = new EmailService({ APP_URL: 'https://example.test/' });
    const before = Date.now();
    const { raw, hash, expiresAt } = service.createConfirmationToken(60_000);

    expect(raw).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(crypto.createHash('sha256').update(raw).digest('hex'));
    expect(service.hashToken(raw)).toBe(hash);
    expect(new Date(expiresAt).getTime()).toBeGreaterThanOrEqual(before + 60_000 - 1000);
  });

  it('genera tokens distintos en cada llamada', () => {
    const service = new EmailService({ APP_URL: 'https://example.test' });
    const first = service.createConfirmationToken();
    const second = service.createConfirmationToken();
    expect(first.raw).not.toBe(second.raw);
    expect(first.hash).not.toBe(second.hash);
  });

  it('construye el enlace de confirmación sobre /api/auth/confirm en modo simulado', async () => {
    const service = new EmailService({
      APP_URL: 'https://hellfall.example/',
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: ''
    });

    const result = await service.sendVerificationEmail('nuevo@uclm.es', 'token-de-prueba');

    expect(service.enabled).toBe(false);
    expect(result.simulated).toBe(true);
    expect(result.verifyUrl).toBe('https://hellfall.example/api/auth/confirm?token=token-de-prueba');
  });

  it('activa el transporte SMTP cuando hay host y credenciales', () => {
    const service = new EmailService({
      APP_URL: 'https://hellfall.example',
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: '465',
      SMTP_USER: 'correo@example.test',
      SMTP_PASS: 'secreto',
      SMTP_FROM: 'HELLFALL <correo@example.test>'
    });

    expect(service.enabled).toBe(true);
    expect(service.transporter).toBeTruthy();
    expect(service.transporter.options.host).toBe('smtp.example.test');
    expect(service.transporter.options.secure).toBe(true);
    expect(service.from).toBe('HELLFALL <correo@example.test>');
  });
});
