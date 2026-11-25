import * as THREE from 'three';

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeat = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  if (repeat !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
  }
  tex.needsUpdate = true;
  return tex;
}

function finalizeDataTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeat = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = maxAnisotropy;
  if (repeat !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
  }
  tex.needsUpdate = true;
  return tex;
}

export interface ProceduralTexturePack {
  woodColor: THREE.CanvasTexture;
  woodBump: THREE.CanvasTexture;
  ceramicColor: THREE.CanvasTexture;
  ceramicBump: THREE.CanvasTexture;
  slateColor: THREE.CanvasTexture;
  dosaColor: THREE.CanvasTexture;
  pancakeColor: THREE.CanvasTexture;
  pizzaColor: THREE.CanvasTexture;
  curryColor: THREE.CanvasTexture;
  makhaniColor: THREE.CanvasTexture;
  biryaniColor: THREE.CanvasTexture;
  palakColor: THREE.CanvasTexture;
  cucumberColor: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTexturePack(maxAnisotropy: number): ProceduralTexturePack {
  const allTextures: THREE.Texture[] = [];
  const track = <T extends THREE.Texture>(t: T): T => {
    allTextures.push(t);
    return t;
  };

  // 1. Warm oak wood turntable grain (color + bump)
  const woodColorCanvas = document.createElement('canvas');
  woodColorCanvas.width = 512;
  woodColorCanvas.height = 512;
  const wc = woodColorCanvas.getContext('2d')!;
  wc.fillStyle = '#6f4e32';
  wc.fillRect(0, 0, 512, 512);

  const woodBumpCanvas = document.createElement('canvas');
  woodBumpCanvas.width = 512;
  woodBumpCanvas.height = 512;
  const wb = woodBumpCanvas.getContext('2d')!;
  wb.fillStyle = '#808080';
  wb.fillRect(0, 0, 512, 512);

  const woodRng = createRng(1042);
  for (let y = 0; y < 512; y++) {
    const wave = Math.sin(y * 0.045) * 10 + Math.sin(y * 0.14) * 4;
    const tone = Math.floor((woodRng() - 0.5) * 16);
    wc.fillStyle = `rgb(${108 + tone}, ${74 + Math.floor(tone * 0.7)}, ${47 + Math.floor(tone * 0.5)})`;
    wc.fillRect(0, y, 512, 1);

    const bVal = 128 + tone * 2;
    wb.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
    wb.fillRect(0, y, 512, 1);

    if (woodRng() > 0.72) {
      wc.strokeStyle = 'rgba(54, 34, 18, 0.25)';
      wc.lineWidth = 1 + woodRng() * 1.5;
      wc.beginPath();
      wc.moveTo(0, y + wave * 0.2);
      wc.bezierCurveTo(170, y + wave, 340, y - wave, 512, y + wave * 0.15);
      wc.stroke();
    }
  }
  for (const seamY of [128, 256, 384]) {
    wc.fillStyle = 'rgba(35, 22, 12, 0.35)';
    wc.fillRect(0, seamY, 512, 2);
    wb.fillStyle = '#383838';
    wb.fillRect(0, seamY, 512, 2);
  }

  const woodColor = track(finalizeColorTexture(woodColorCanvas, maxAnisotropy, 1));
  const woodBump = track(finalizeDataTexture(woodBumpCanvas, maxAnisotropy, 1));

  // 2. Speckled stoneware ceramic glaze + bump
  const cerCanvas = document.createElement('canvas');
  cerCanvas.width = 512;
  cerCanvas.height = 512;
  const cc = cerCanvas.getContext('2d')!;
  cc.fillStyle = '#ebe4d5';
  cc.fillRect(0, 0, 512, 512);

  const cerBumpCanvas = document.createElement('canvas');
  cerBumpCanvas.width = 512;
  cerBumpCanvas.height = 512;
  const cb = cerBumpCanvas.getContext('2d')!;
  cb.fillStyle = '#858585';
  cb.fillRect(0, 0, 512, 512);

  const cerRng = createRng(2099);
  for (let i = 0; i < 2400; i++) {
    const x = cerRng() * 512;
    const y = cerRng() * 512;
    const r = 0.6 + cerRng() * 1.7;
    cc.fillStyle = cerRng() > 0.3 ? 'rgba(92, 82, 68, 0.28)' : 'rgba(255, 252, 245, 0.35)';
    cc.beginPath();
    cc.arc(x, y, r, 0, Math.PI * 2);
    cc.fill();

    cb.fillStyle = cerRng() > 0.5 ? '#707070' : '#9a9a9a';
    cb.beginPath();
    cb.arc(x, y, r, 0, Math.PI * 2);
    cb.fill();
  }
  const ceramicColor = track(finalizeColorTexture(cerCanvas, maxAnisotropy, 2));
  const ceramicBump = track(finalizeDataTexture(cerBumpCanvas, maxAnisotropy, 2));

  // 3. Dark charcoal slate texture
  const slateCanvas = document.createElement('canvas');
  slateCanvas.width = 512;
  slateCanvas.height = 512;
  const sc = slateCanvas.getContext('2d')!;
  sc.fillStyle = '#2d3130';
  sc.fillRect(0, 0, 512, 512);
  const slateRng = createRng(3311);
  for (let i = 0; i < 1800; i++) {
    const x = slateRng() * 512;
    const y = slateRng() * 512;
    const r = 1 + slateRng() * 5;
    sc.fillStyle = slateRng() > 0.5 ? 'rgba(65, 70, 68, 0.22)' : 'rgba(22, 25, 24, 0.28)';
    sc.beginPath();
    sc.arc(x, y, r, 0, Math.PI * 2);
    sc.fill();
  }
  const slateColor = track(finalizeColorTexture(slateCanvas, maxAnisotropy, 2));

  // 4. Crispy Masala Dosa texture
  const dosaCanvas = document.createElement('canvas');
  dosaCanvas.width = 512;
  dosaCanvas.height = 512;
  const dc = dosaCanvas.getContext('2d')!;
  const dosaGrad = dc.createLinearGradient(0, 0, 512, 512);
  dosaGrad.addColorStop(0, '#c97e2f');
  dosaGrad.addColorStop(0.5, '#dd9b48');
  dosaGrad.addColorStop(1, '#b56a22');
  dc.fillStyle = dosaGrad;
  dc.fillRect(0, 0, 512, 512);
  const dosaRng = createRng(4401);
  for (let i = 0; i < 3200; i++) {
    const x = dosaRng() * 512;
    const y = dosaRng() * 512;
    const r = 0.8 + dosaRng() * 3.2;
    dc.fillStyle =
      dosaRng() > 0.4
        ? `rgba(110, 52, 12, ${0.15 + dosaRng() * 0.25})`
        : `rgba(246, 208, 134, ${0.22 + dosaRng() * 0.25})`;
    dc.beginPath();
    dc.arc(x, y, r, 0, Math.PI * 2);
    dc.fill();
  }
  const dosaColor = track(finalizeColorTexture(dosaCanvas, maxAnisotropy, 1));

  // 5. Golden griddle pancake / paratha top texture
  const panCanvas = document.createElement('canvas');
  panCanvas.width = 512;
  panCanvas.height = 512;
  const pc = panCanvas.getContext('2d')!;
  pc.fillStyle = '#e7b56b';
  pc.fillRect(0, 0, 512, 512);
  const panGrad = pc.createRadialGradient(256, 256, 40, 256, 256, 240);
  panGrad.addColorStop(0, '#c8732a');
  panGrad.addColorStop(0.65, '#d98e40');
  panGrad.addColorStop(1, '#efd097');
  pc.fillStyle = panGrad;
  pc.fillRect(0, 0, 512, 512);
  const panRng = createRng(5502);
  for (let i = 0; i < 1200; i++) {
    const x = panRng() * 512;
    const y = panRng() * 512;
    const r = 1 + panRng() * 2.5;
    pc.fillStyle = panRng() > 0.5 ? 'rgba(138, 74, 24, 0.2)' : 'rgba(252, 224, 170, 0.2)';
    pc.beginPath();
    pc.arc(x, y, r, 0, Math.PI * 2);
    pc.fill();
  }
  const pancakeColor = track(finalizeColorTexture(panCanvas, maxAnisotropy, 1));

  // 6. Artisan wood-fired pizza sauce & mozzarella marbling
  const pizzaCanvas = document.createElement('canvas');
  pizzaCanvas.width = 512;
  pizzaCanvas.height = 512;
  const pzc = pizzaCanvas.getContext('2d')!;
  pzc.fillStyle = '#b93420';
  pzc.fillRect(0, 0, 512, 512);
  const pzRng = createRng(6603);
  for (let i = 0; i < 500; i++) {
    const x = pzRng() * 512;
    const y = pzRng() * 512;
    pzc.fillStyle = pzRng() > 0.5 ? 'rgba(145, 34, 16, 0.45)' : 'rgba(210, 68, 38, 0.35)';
    pzc.beginPath();
    pzc.arc(x, y, 4 + pzRng() * 14, 0, Math.PI * 2);
    pzc.fill();
  }
  for (let i = 0; i < 24; i++) {
    const x = 64 + pzRng() * 384;
    const y = 64 + pzRng() * 384;
    const rad = 20 + pzRng() * 32;
    const mGrad = pzc.createRadialGradient(x, y, 4, x, y, rad);
    mGrad.addColorStop(0, '#faf3e1');
    mGrad.addColorStop(0.75, '#f2e2bd');
    mGrad.addColorStop(1, 'rgba(242, 226, 189, 0)');
    pzc.fillStyle = mGrad;
    pzc.beginPath();
    pzc.arc(x, y, rad, 0, Math.PI * 2);
    pzc.fill();
  }
  const pizzaColor = track(finalizeColorTexture(pizzaCanvas, maxAnisotropy, 1));

  // 7. Spiced Indian Chickpea Curry masala texture
  const curryCanvas = document.createElement('canvas');
  curryCanvas.width = 512;
  curryCanvas.height = 512;
  const crc = curryCanvas.getContext('2d')!;
  const crGrad = crc.createRadialGradient(256, 256, 30, 256, 256, 256);
  crGrad.addColorStop(0, '#c65a1e');
  crGrad.addColorStop(0.65, '#a84316');
  crGrad.addColorStop(1, '#7f2d0d');
  crc.fillStyle = crGrad;
  crc.fillRect(0, 0, 512, 512);
  const crRng = createRng(7704);
  for (let i = 0; i < 1500; i++) {
    const x = crRng() * 512;
    const y = crRng() * 512;
    crc.fillStyle =
      crRng() > 0.35
        ? 'rgba(224, 128, 42, 0.25)'
        : crRng() > 0.5
          ? 'rgba(72, 28, 12, 0.3)'
          : 'rgba(255, 240, 210, 0.14)';
    crc.beginPath();
    crc.arc(x, y, 1 + crRng() * 4, 0, Math.PI * 2);
    crc.fill();
  }
  const curryColor = track(finalizeColorTexture(curryCanvas, maxAnisotropy, 1));

  // 8. Velvety Makhani Tomato-Butter Gravy Texture
  const makhaniCanvas = document.createElement('canvas');
  makhaniCanvas.width = 512;
  makhaniCanvas.height = 512;
  const mkc = makhaniCanvas.getContext('2d')!;
  const mkGrad = mkc.createRadialGradient(256, 256, 20, 256, 256, 256);
  mkGrad.addColorStop(0, '#e36e2b');
  mkGrad.addColorStop(0.65, '#cf501d');
  mkGrad.addColorStop(1, '#aa3812');
  mkc.fillStyle = mkGrad;
  mkc.fillRect(0, 0, 512, 512);
  const mkRng = createRng(8805);
  for (let i = 0; i < 900; i++) {
    const x = mkRng() * 512;
    const y = mkRng() * 512;
    mkc.fillStyle = mkRng() > 0.5 ? 'rgba(247, 154, 72, 0.22)' : 'rgba(148, 42, 12, 0.18)';
    mkc.beginPath();
    mkc.arc(x, y, 2 + mkRng() * 8, 0, Math.PI * 2);
    mkc.fill();
  }
  const makhaniColor = track(finalizeColorTexture(makhaniCanvas, maxAnisotropy, 1));

  // 9. Saffron & White Basmati Biryani Rice Grain Texture
  const biryaniCanvas = document.createElement('canvas');
  biryaniCanvas.width = 512;
  biryaniCanvas.height = 512;
  const byc = biryaniCanvas.getContext('2d')!;
  byc.fillStyle = '#f5ebd1';
  byc.fillRect(0, 0, 512, 512);
  const byRng = createRng(9906);
  for (let i = 0; i < 2800; i++) {
    const x = byRng() * 512;
    const y = byRng() * 512;
    const angle = byRng() * Math.PI;
    const tone = byRng();
    byc.save();
    byc.translate(x, y);
    byc.rotate(angle);
    byc.fillStyle =
      tone > 0.65
        ? '#e89323'
        : tone > 0.38
          ? '#f2be49'
          : tone > 0.1
            ? '#fbf7eb'
            : '#8d4316';
    byc.beginPath();
    byc.ellipse(0, 0, 7, 2.2, 0, 0, Math.PI * 2);
    byc.fill();
    byc.restore();
  }
  const biryaniColor = track(finalizeColorTexture(biryaniCanvas, maxAnisotropy, 1));

  // 10. Vibrant Emerald Palak Paneer Spinach Gravy Texture
  const palakCanvas = document.createElement('canvas');
  palakCanvas.width = 512;
  palakCanvas.height = 512;
  const plc = palakCanvas.getContext('2d')!;
  const plGrad = plc.createRadialGradient(256, 256, 24, 256, 256, 256);
  plGrad.addColorStop(0, '#3a6f33');
  plGrad.addColorStop(0.65, '#2b5827');
  plGrad.addColorStop(1, '#1e421c');
  plc.fillStyle = plGrad;
  plc.fillRect(0, 0, 512, 512);
  const plRng = createRng(11107);
  for (let i = 0; i < 1600; i++) {
    const x = plRng() * 512;
    const y = plRng() * 512;
    plc.fillStyle = plRng() > 0.45 ? 'rgba(84, 146, 66, 0.25)' : 'rgba(20, 48, 18, 0.28)';
    plc.beginPath();
    plc.arc(x, y, 1 + plRng() * 4, 0, Math.PI * 2);
    plc.fill();
  }
  const palakColor = track(finalizeColorTexture(palakCanvas, maxAnisotropy, 1));

  // 11. Cucumber slice seed wheel texture
  const cucCanvas = document.createElement('canvas');
  cucCanvas.width = 256;
  cucCanvas.height = 256;
  const cuc = cucCanvas.getContext('2d')!;
  cuc.fillStyle = '#3b6d33';
  cuc.fillRect(0, 0, 256, 256);
  const cucGrad = cuc.createRadialGradient(128, 128, 10, 128, 128, 118);
  cucGrad.addColorStop(0, '#dceec9');
  cucGrad.addColorStop(0.65, '#c4e0a4');
  cucGrad.addColorStop(0.88, '#90be6d');
  cucGrad.addColorStop(1, '#36682f');
  cuc.fillStyle = cucGrad;
  cuc.beginPath();
  cuc.arc(128, 128, 122, 0, Math.PI * 2);
  cuc.fill();
  cuc.fillStyle = '#f2f7dd';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cuc.save();
    cuc.translate(128 + Math.cos(a) * 44, 128 + Math.sin(a) * 44);
    cuc.rotate(a);
    cuc.beginPath();
    cuc.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2);
    cuc.fill();
    cuc.restore();
  }
  const cucumberColor = track(finalizeColorTexture(cucCanvas, maxAnisotropy, 1));

  // 12. Soft radial contact shadow plane texture
  const shCanvas = document.createElement('canvas');
  shCanvas.width = 256;
  shCanvas.height = 256;
  const shc = shCanvas.getContext('2d')!;
  const shGrad = shc.createRadialGradient(128, 128, 16, 128, 128, 126);
  shGrad.addColorStop(0, 'rgba(14, 20, 15, 0.72)');
  shGrad.addColorStop(0.45, 'rgba(14, 20, 15, 0.34)');
  shGrad.addColorStop(0.8, 'rgba(14, 20, 15, 0.08)');
  shGrad.addColorStop(1, 'rgba(14, 20, 15, 0)');
  shc.fillStyle = shGrad;
  shc.fillRect(0, 0, 256, 256);
  const contactShadow = track(finalizeDataTexture(shCanvas, maxAnisotropy, 1));

  return {
    woodColor,
    woodBump,
    ceramicColor,
    ceramicBump,
    slateColor,
    dosaColor,
    pancakeColor,
    pizzaColor,
    curryColor,
    makhaniColor,
    biryaniColor,
    palakColor,
    cucumberColor,
    contactShadow,
    dispose: () => {
      allTextures.forEach((t) => t.dispose());
    },
  };
}
