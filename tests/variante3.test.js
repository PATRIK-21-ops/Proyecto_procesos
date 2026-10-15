import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { verificarDominioEmail } from '../src/services/userService.js';

describe('Validación de dominios permitidos (variante3)', () => {
  const originalEnv = process.env.ALLOWED_DOMAINS;

  beforeEach(() => {
    process.env.ALLOWED_DOMAINS = 'uclm.es,alu.uclm.es';
  });

  afterEach(() => {
    process.env.ALLOWED_DOMAINS = originalEnv;
  });

  test('variante3: permite dominios listados en ALLOWED_DOMAINS sin distinguir mayúsculas', () => {
    expect(verificarDominioEmail('ana@uclm.es')).toEqual({ permitido: true });
    expect(verificarDominioEmail('CARLOS@ALU.UCLM.ES')).toEqual({ permitido: true });
  });

  test('variante3: rechaza subdominios no listados y dominios no permitidos', () => {
    expect(verificarDominioEmail('x@sub.uclm.es')).toEqual({ permitido: false });
    expect(verificarDominioEmail('usuario@gmail.com')).toEqual({ permitido: false });
  });

  test('variante3: lanza error cuando el email no contiene @ o es inválido', () => {
    expect(() => verificarDominioEmail('anauclm.es')).toThrow();
    expect(() => verificarDominioEmail(null)).toThrow();
  });
});