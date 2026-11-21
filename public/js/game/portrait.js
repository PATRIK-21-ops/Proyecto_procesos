// ============================================================================
// RETRATO REALISTA PIXEL-ART Y PERFIL CANÓNICO DEL SLAYER
// ============================================================================

const SLAYER_PROFILE = {
  id: 'slayer',
  gender: 'SLAYER',
  name: 'SLAYER',
  callsign: 'SLAYER',
  role: 'CENTINELA DEL ABISMO',
  bio: 'Único superviviente del Protocolo Phobos. Forjado en acero y pólvora para purgar los diez sectores del infierno.',
  hurtPitch: 1.0,
  accent: '#ff4d00'
};

export const CHARACTERS = {
  slayer: SLAYER_PROFILE,
  male: SLAYER_PROFILE
};

export function getCharacterProfile() {
  return SLAYER_PROFILE;
}

/**
 * Dibuja el retrato pixel-art del Slayer (32x30 lógico) con sombreado anatómico,
 * mirada dinámica y heridas/sangre progresivas según su salud.
 */
export function drawCharacterFace(c, x, y, opts = {}) {
  const {
    hp = 100,
    isHit = false,
    isGrin = false,
    isFiring = false,
    lookDir = 0,
    now = 0
  } = opts;

  const isFemale = false;
  const px = (dx, dy, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x + dx, y + dy, w, h);
  };

  // Marco metálico oscuro del visor HUD
  px(0, 0, 32, 30, '#0d0607');
  px(1, 1, 30, 28, '#1b1719');
  px(2, 2, 28, 26, '#271e20');

  // --- ESTADO MUERTO (Cráneo ensangrentado realista) ---
  if (hp <= 0) {
    px(8, 3, 16, 17, '#140708');
    px(9, 4, 14, 13, '#b8ab9e');
    px(11, 4, 10, 4, '#e5ddd0');
    px(13, 5, 6, 2, '#f5efe6');
    // Cuencas oculares profundas
    px(9, 10, 5, 4, '#0c0405');
    px(18, 10, 5, 4, '#0c0405');
    px(10, 11, 2, 2, '#690008');
    px(19, 11, 2, 2, '#690008');
    // Pómulos y fosa nasal
    px(8, 14, 3, 3, '#96877a');
    px(21, 14, 3, 3, '#96877a');
    px(15, 13, 2, 4, '#140708');
    // Mandíbula y dientes
    px(10, 18, 12, 8, '#96877a');
    px(11, 19, 10, 6, '#d8d0c4');
    for (let tx = 11; tx <= 19; tx += 2) {
      px(tx, 20, 1, 4, '#140708');
    }
    // Regueros de sangre sobre el cráneo
    px(10, 5, 2, 6, '#9e000b');
    px(11, 10, 1, 4, '#d90429');
    px(20, 7, 2, 8, '#780000');
    px(14, 21, 4, 7, '#a3000c');
    return;
  }

  // Cuello y hombreras blindadas UAC en la base
  px(3, 25, 26, 4, isFemale ? '#1c2b33' : '#213626');
  px(5, 24, 22, 5, isFemale ? '#2a424d' : '#2d4c34');
  px(10, 23, 12, 6, '#9e684b');
  px(11, 24, 10, 5, '#7a4b35'); // Sombra bajo barbilla

  // Paleta de piel con 5 tonos de sombreado anatómico
  const skinShadow2 = isFemale ? '#9c634b' : '#8f5940';
  const skinShadow1 = isFemale ? '#c48367' : '#b8785a';
  const skinBase = isFemale ? '#df9e81' : '#d69372';
  const skinLight = isFemale ? '#f0b89d' : '#e8ac8d';
  const skinSpec = isFemale ? '#f8d2be' : '#f2c5ad';

  // Orejas con relieve interno
  px(5, 12, 2, 7, skinShadow2);
  px(25, 12, 2, 7, skinShadow2);
  px(5, 13, 1, 4, skinShadow1);
  px(26, 13, 1, 4, skinShadow1);

  // Silueta del cráneo y mandíbula (más angulosa/ancha en hombre, más perfilada en mujer)
  if (isFemale) {
    px(7, 5, 18, 16, skinShadow1);
    px(8, 6, 16, 14, skinBase);
    px(9, 20, 14, 3, skinShadow1);
    px(11, 22, 10, 3, skinShadow2);
    px(12, 22, 8, 2, skinBase);
    // Pómulos marcados y luz frontal
    px(9, 7, 14, 4, skinLight);
    px(11, 7, 10, 2, skinSpec);
    px(8, 14, 3, 4, skinLight);
    px(21, 14, 3, 4, skinLight);
    px(9, 17, 2, 3, skinShadow1);
    px(21, 17, 2, 3, skinShadow1);
  } else {
    px(6, 5, 20, 17, skinShadow1);
    px(7, 6, 18, 15, skinBase);
    px(8, 21, 16, 4, skinShadow2);
    px(9, 21, 14, 3, skinShadow1);
    px(11, 22, 10, 2, skinBase);
    // Frente amplia, sienes sombreadas y mandíbula cuadrada
    px(8, 7, 16, 4, skinLight);
    px(11, 7, 10, 2, skinSpec);
    px(7, 14, 2, 5, skinShadow2);
    px(23, 14, 2, 5, skinShadow2);
    px(9, 14, 3, 4, skinLight);
    px(20, 14, 3, 4, skinLight);
    // Sombra de barba incipiente realista en mandíbula masculina
    px(9, 18, 14, 5, 'rgba(65, 36, 26, 0.22)');
  }

  // Pelo detallado según personaje
  if (isFemale) {
    // Cabello oscuro con mechas carmesí/cobrizas y flequillo lateral dinámico
    px(6, 2, 20, 5, '#1d1014');
    px(7, 2, 18, 4, '#381922');
    px(9, 3, 12, 2, '#692434');
    px(11, 3, 6, 1, '#9e3244');
    // Mechones laterales enmarcando el rostro
    px(6, 5, 3, 11, '#261118');
    px(23, 5, 3, 10, '#261118');
    px(7, 6, 2, 6, '#591e2b');
    px(23, 6, 2, 5, '#591e2b');
    // Flequillo asimétrico sobre frente
    px(8, 5, 6, 3, '#381922');
    px(9, 6, 3, 2, '#7d293a');
  } else {
    // Corte militar táctico castaño oscuro con entradas marcadas y brillos
    px(6, 2, 20, 5, '#2b1910');
    px(7, 3, 18, 3, '#472a1b');
    px(9, 3, 12, 2, '#613c28');
    px(12, 3, 5, 1, '#7a4e36');
    px(6, 6, 2, 5, '#331d12');
    px(24, 6, 2, 5, '#331d12');
  }

  // Arco superciliar (sombra bajo cejas) y cejas expresivas
  px(8, 10, 6, 2, skinShadow2);
  px(18, 10, 6, 2, skinShadow2);
  const browDrop = isHit ? -1 : (isFiring || isGrin ? 1 : 0);
  const browCol = isFemale ? '#261118' : '#2e1a10';
  if (isFemale) {
    px(8, 10 + (isHit ? -1 : 0), 5, 1, browCol);
    px(11, 10 + browDrop, 3, 1, browCol);
    px(19, 10 + (isHit ? -1 : 0), 5, 1, browCol);
    px(18, 10 + browDrop, 3, 1, browCol);
  } else {
    px(8, 10 + (isHit ? -1 : 0), 6, 2, browCol);
    px(18, 10 + (isHit ? -1 : 0), 6, 2, browCol);
    if (isFiring || isGrin) {
      px(12, 11, 2, 1, browCol);
      px(18, 11, 2, 1, browCol);
    }
  }

  // Ojos anatómicos (cuenca + esclerótica + iris coloreado + pupila + brillo)
  const eyeH = hp < 25 && !isHit ? 2 : 3;
  px(8, 12, 6, eyeH + 1, skinShadow2);
  px(18, 12, 6, eyeH + 1, skinShadow2);
  px(9, 12, 5, eyeH, '#e8e4dc');
  px(18, 12, 5, eyeH, '#e8e4dc');
  // Sombra superior del párpado
  px(9, 12, 5, 1, '#c2bab0');
  px(18, 12, 5, 1, '#c2bab0');

  const irisCol = isFiring || isGrin ? '#ff9e00' : (isFemale ? '#00b4d8' : '#4a6b82');
  const pupilCol = '#0c0608';
  const ex = clampDir(lookDir);
  px(10 + ex, 12, 3, eyeH, irisCol);
  px(19 + ex, 12, 3, eyeH, irisCol);
  px(11 + ex, 12 + (eyeH > 2 ? 1 : 0), 1, Math.min(2, eyeH), pupilCol);
  px(20 + ex, 12 + (eyeH > 2 ? 1 : 0), 1, Math.min(2, eyeH), pupilCol);
  // Punto especular en los ojos
  px(10 + ex, 12, 1, 1, '#ffffff');
  px(19 + ex, 12, 1, 1, '#ffffff');

  // Nariz esculpida (puente iluminado, sombra lateral y fosas nasales)
  px(15, 12, 2, 5, skinLight);
  px(15, 14, 1, 3, skinSpec);
  px(14, 15, 1, 3, skinShadow1);
  px(17, 15, 1, 3, skinShadow1);
  px(14, 17, 4, 1, skinShadow2);
  px(14, 17, 1, 1, '#4a261b');
  px(17, 17, 1, 1, '#4a261b');

  // Surco nasolabial y boca expresiva
  px(12, 18, 1, 2, skinShadow1);
  px(19, 18, 1, 2, skinShadow1);

  if (isHit) {
    // Mueca de dolor abierta
    px(11, 19, 10, 5, '#2b080a');
    px(12, 19, 8, 1, '#e6dcd0');
    px(12, 23, 8, 1, '#d1c5b6');
    px(13, 21, 6, 2, '#8a1c22'); // Lengua/interior
  } else if (isGrin) {
    // Sonrisa sádica DOOM al coger botín / powerup
    px(9, 19, 14, 4, '#240709');
    px(10, 19, 12, 2, '#f2ede4');
    px(10, 21, 12, 1, '#d4cabd');
    for (let tx = 11; tx <= 20; tx += 3) px(tx, 20, 1, 2, '#6e4e44');
  } else if (isFiring) {
    // Dientes apretados al disparar
    px(10, 19, 12, 4, '#240709');
    px(10, 20, 12, 2, '#f5efe6');
    px(12, 20, 1, 2, '#a3978a');
    px(15, 20, 1, 2, '#a3978a');
    px(18, 20, 1, 2, '#a3978a');
  } else {
    // Boca firme seria con sombra de labio superior e inferior
    px(12, 19, 8, 1, skinShadow2);
    px(11, 20, 10, 2, isFemale ? '#9c4c4f' : '#7d4438');
    px(13, 21, 6, 1, isFemale ? '#ba6669' : '#96584b');
    px(13, 22, 6, 1, skinShadow1);
  }

  // Cicatriz de combate sutil (hombre: mejilla izquierda; mujer: ceja derecha)
  if (!isFemale) {
    px(19, 15, 1, 3, '#a86050');
    px(20, 17, 1, 2, '#914c3f');
  } else {
    px(21, 9, 1, 3, '#a85a50');
  }

  // --- DAÑO Y SANGRE REALISTA PROGRESIVA ---
  if (hp < 85) {
    // Moratón en pómulo y corte superficial en ceja
    px(8, 14, 3, 2, 'rgba(95, 22, 42, 0.45)');
    px(9, 8, 2, 2, '#780008');
    px(10, 9, 1, 3, '#d90429');
  }
  if (hp < 65) {
    // Labio partido + hilo de sangre en la frente + hematomas
    px(20, 13, 4, 3, 'rgba(110, 18, 45, 0.52)');
    px(15, 6, 2, 4, '#660006');
    px(16, 8, 1, 5, '#d90429');
    px(12, 21, 2, 3, '#a3000c');
    px(13, 23, 1, 3, '#e63946');
  }
  if (hp < 45) {
    // Laceración profunda en mejilla + sangre en dientes y barbilla
    px(21, 14, 3, 5, '#6e000a');
    px(22, 15, 2, 5, '#b80c09');
    px(23, 18, 1, 5, '#ff2a2a');
    px(9, 19, 3, 3, '#8c000b');
    px(16, 23, 3, 4, '#8f000b');
    // Sangre sobre los dientes si está disparando o gritando
    if (isHit || isFiring) {
      px(13, 20, 2, 2, '#c9041b');
      px(17, 20, 1, 2, '#d90429');
    }
  }
  if (hp < 25) {
    // Estado crítico: ojo izquierdo amoratado semicerrado y hemorragia por el cuello
    px(8, 11, 6, 4, '#4a0414');
    px(9, 12, 4, 1, '#ff4d4d');
    px(7, 13, 2, 9, '#8a0009');
    px(8, 16, 2, 9, '#d90429');
    px(19, 20, 3, 8, '#780000');
    px(20, 22, 1, 6, '#ff2a2a');
    // Gota animada cayendo por el mentón
    const drip = Math.floor((now / 260) % 4);
    px(14, 24 + drip, 2, 2, '#ff1e27');
  }
}

function clampDir(v) {
  return v < -1 ? -1 : (v > 1 ? 1 : v);
}
