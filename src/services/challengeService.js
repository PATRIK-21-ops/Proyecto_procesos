import { createHmac } from 'node:crypto';

/**
 * Desafío diario: cada día hay una semilla con la que todos los jugadores juegan
 * el mismo plan de sectores y los mismos mapas.
 * La semilla sale de un HMAC de la fecha con un secreto del servidor, así no se puede
 * calcular la de mañana desde el navegador.
 */
export class ChallengeService {
  constructor({ secret, now = () => new Date(), timeZone = 'Europe/Madrid' } = {}) {
    if (!secret) throw new Error('ChallengeService necesita un secreto.');
    this.secret = secret;
    this.now = now;
    this.formatoFecha = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  /** Fecha AAAA-MM-DD en la zona horaria del juego (el día cambia a medianoche en España). */
  fechaDe(fecha) {
    return this.formatoFecha.format(fecha);
  }

  /** Semilla entera de 32 bits para una fecha AAAA-MM-DD. */
  semillaDe(fecha) {
    return createHmac('sha256', this.secret).update(`hellfall-desafio:${fecha}`).digest().readUInt32BE(0);
  }

  today() {
    const date = this.fechaDe(this.now());
    return { date, seed: this.semillaDe(date) };
  }
}
