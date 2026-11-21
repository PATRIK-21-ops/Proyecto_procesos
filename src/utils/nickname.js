import { randomInt } from 'node:crypto';

const NICKNAME_PREFIXES = [
  'Slayer',
  'Phobos',
  'Doomblade',
  'Argenta',
  'Valkyrie',
  'Reaper',
  'Hellfire',
  'Centinela',
  'Deimos',
  'Titan'
];

export const NICKNAME_RE = /^[a-zA-Z0-9À-ÿ _.-]{2,24}$/;

export function generateRandomNickname() {
  const prefix = NICKNAME_PREFIXES[randomInt(0, NICKNAME_PREFIXES.length)];
  const suffix = randomInt(100, 1000);
  return `${prefix}-${suffix}`;
}

export function normalizeNickname(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/\s+/g, ' ');
}

export function isValidNickname(raw) {
  const normalized = normalizeNickname(raw);
  return NICKNAME_RE.test(normalized);
}
