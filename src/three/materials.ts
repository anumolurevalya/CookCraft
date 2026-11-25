import * as THREE from 'three';
import type { ProceduralTexturePack } from './proceduralTextures';

export type VesselFinishPreset = 'ceramic' | 'slate' | 'copper';

export interface CulinaryMaterialLibrary {
  tableWood: THREE.MeshStandardMaterial;
  turntableRim: THREE.MeshPhysicalMaterial;
  vesselPrimary: THREE.MeshPhysicalMaterial;
  vesselAccent: THREE.MeshPhysicalMaterial;
  terracottaClay: THREE.MeshStandardMaterial;
  stainlessSteel: THREE.MeshPhysicalMaterial;
  brushedBrass: THREE.MeshPhysicalMaterial;
  carvedWood: THREE.MeshStandardMaterial;
  linenCloth: THREE.MeshStandardMaterial;
  pastaRibbon: THREE.MeshStandardMaterial;
  creamSauce: THREE.MeshPhysicalMaterial;
  garlicClove: THREE.MeshStandardMaterial;
  parmesanFlake: THREE.MeshStandardMaterial;
  herbLeaf: THREE.MeshStandardMaterial;
  pepperGrain: THREE.MeshStandardMaterial;
  dosaShell: THREE.MeshStandardMaterial;
  potatoMasala: THREE.MeshStandardMaterial;
  coconutChutney: THREE.MeshStandardMaterial;
  sambarBroth: THREE.MeshPhysicalMaterial;
  tomatoChutney: THREE.MeshStandardMaterial;
  lettuceLeaf: THREE.MeshStandardMaterial;
  cucumberSlice: THREE.MeshStandardMaterial;
  cherryTomato: THREE.MeshPhysicalMaterial;
  redOnion: THREE.MeshStandardMaterial;
  lemonFlesh: THREE.MeshStandardMaterial;
  pancakeCrumb: THREE.MeshStandardMaterial;
  butterPat: THREE.MeshPhysicalMaterial;
  mapleSyrup: THREE.MeshPhysicalMaterial;
  blueberry: THREE.MeshStandardMaterial;
  pizzaCrust: THREE.MeshStandardMaterial;
  pizzaCenter: THREE.MeshStandardMaterial;
  mozzarella: THREE.MeshPhysicalMaterial;
  curryGravy: THREE.MeshPhysicalMaterial;
  makhaniGravy: THREE.MeshPhysicalMaterial;
  paneerCube: THREE.MeshStandardMaterial;
  biryaniRice: THREE.MeshStandardMaterial;
  crispyOnion: THREE.MeshStandardMaterial;
  palakGravy: THREE.MeshPhysicalMaterial;
  idliCake: THREE.MeshStandardMaterial;
  bhaturaBread: THREE.MeshStandardMaterial;
  choleGravy: THREE.MeshPhysicalMaterial;
  parathaBread: THREE.MeshStandardMaterial;
  whiteButter: THREE.MeshPhysicalMaterial;
  mangoPickle: THREE.MeshPhysicalMaterial;
  chickpea: THREE.MeshStandardMaterial;
  basmatiRice: THREE.MeshStandardMaterial;
  naanBread: THREE.MeshStandardMaterial;
  pohaFlake: THREE.MeshStandardMaterial;
  avocadoMash: THREE.MeshStandardMaterial;
  poachedEggWhite: THREE.MeshPhysicalMaterial;
  eggYolk: THREE.MeshPhysicalMaterial;
  rajmaGravy: THREE.MeshPhysicalMaterial;
  hummusCream: THREE.MeshStandardMaterial;
  dalMakhaniGravy: THREE.MeshPhysicalMaterial;
  risottoGrain: THREE.MeshPhysicalMaterial;
  creminiMushroom: THREE.MeshStandardMaterial;
  tamarindGlaze: THREE.MeshPhysicalMaterial;
  gulabSyrup: THREE.MeshPhysicalMaterial;
  gulabBall: THREE.MeshPhysicalMaterial;
  mangoPuree: THREE.MeshPhysicalMaterial;
  pistachioCrumb: THREE.MeshStandardMaterial;
  cocoaDust: THREE.MeshStandardMaterial;
  espressoSponge: THREE.MeshStandardMaterial;
  bellPepperRed: THREE.MeshPhysicalMaterial;
  clearGlass: THREE.MeshPhysicalMaterial;
  saffronMilk: THREE.MeshPhysicalMaterial;
  gajarHalwa: THREE.MeshPhysicalMaterial;
  moltenChocolate: THREE.MeshPhysicalMaterial;
  chaiTea: THREE.MeshPhysicalMaterial;
  limeJuice: THREE.MeshPhysicalMaterial;
  matchaGreen: THREE.MeshPhysicalMaterial;
  oatMilk: THREE.MeshStandardMaterial;
  raspberryFruit: THREE.MeshStandardMaterial;
  rosePetal: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  applyVesselFinish: (preset: VesselFinishPreset) => void;
  dispose: () => void;
}

export function createCulinaryMaterialLibrary(
  textures: ProceduralTexturePack,
): CulinaryMaterialLibrary {
  const allMaterials: THREE.Material[] = [];
  const track = <T extends THREE.Material>(m: T): T => {
    allMaterials.push(m);
    return m;
  };

  const tableWood = track(
    new THREE.MeshStandardMaterial({
      map: textures.woodColor,
      bumpMap: textures.woodBump,
      bumpScale: 0.015,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );

  const turntableRim = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xb98d52,
      roughness: 0.24,
      metalness: 0.88,
      anisotropy: 0.8,
    }),
  );

  const vesselPrimary = track(
    new THREE.MeshPhysicalMaterial({
      map: textures.ceramicColor,
      bumpMap: textures.ceramicBump,
      bumpScale: 0.008,
      color: 0xf6f1e6,
      roughness: 0.52,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    }),
  );

  const vesselAccent = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x3b4440,
      roughness: 0.68,
      metalness: 0.08,
    }),
  );

  const terracottaClay = track(
    new THREE.MeshStandardMaterial({
      map: textures.ceramicBump,
      color: 0xb96844,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );

  const stainlessSteel = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd9dee0,
      roughness: 0.2,
      metalness: 0.94,
      anisotropy: 0.85,
    }),
  );

  const brushedBrass = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd3a45a,
      roughness: 0.24,
      metalness: 0.92,
      anisotropy: 0.8,
    }),
  );

  const carvedWood = track(
    new THREE.MeshStandardMaterial({
      map: textures.woodColor,
      bumpMap: textures.woodBump,
      bumpScale: 0.012,
      color: 0xb48458,
      roughness: 0.76,
      metalness: 0.0,
    }),
  );

  const linenCloth = track(
    new THREE.MeshStandardMaterial({
      color: 0xe6dfd0,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );

  const pastaRibbon = track(
    new THREE.MeshStandardMaterial({
      color: 0xf1d18a,
      roughness: 0.42,
      metalness: 0.02,
    }),
  );

  const creamSauce = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf7ecd0,
      roughness: 0.16,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    }),
  );

  const garlicClove = track(
    new THREE.MeshStandardMaterial({
      color: 0xd9aa63,
      roughness: 0.56,
      metalness: 0.0,
    }),
  );

  const parmesanFlake = track(
    new THREE.MeshStandardMaterial({
      color: 0xf2e2af,
      roughness: 0.65,
      metalness: 0.0,
    }),
  );

  const herbLeaf = track(
    new THREE.MeshStandardMaterial({
      color: 0x346f38,
      roughness: 0.48,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  );

  const pepperGrain = track(
    new THREE.MeshStandardMaterial({
      color: 0x26221e,
      roughness: 0.82,
      metalness: 0.0,
    }),
  );

  const dosaShell = track(
    new THREE.MeshStandardMaterial({
      map: textures.dosaColor,
      bumpMap: textures.ceramicBump,
      bumpScale: 0.012,
      roughness: 0.62,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
  );

  const potatoMasala = track(
    new THREE.MeshStandardMaterial({
      color: 0xe2af3b,
      roughness: 0.78,
      metalness: 0.0,
    }),
  );

  const coconutChutney = track(
    new THREE.MeshStandardMaterial({
      color: 0xf4f0e4,
      roughness: 0.65,
      metalness: 0.0,
    }),
  );

  const sambarBroth = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc55b1e,
      roughness: 0.18,
      metalness: 0.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    }),
  );

  const tomatoChutney = track(
    new THREE.MeshStandardMaterial({
      color: 0xc83e22,
      roughness: 0.48,
      metalness: 0.0,
    }),
  );

  const lettuceLeaf = track(
    new THREE.MeshStandardMaterial({
      color: 0x5ca342,
      roughness: 0.45,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  );

  const cucumberSlice = track(
    new THREE.MeshStandardMaterial({
      map: textures.cucumberColor,
      roughness: 0.35,
      metalness: 0.0,
    }),
  );

  const cherryTomato = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd23428,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    }),
  );

  const redOnion = track(
    new THREE.MeshStandardMaterial({
      color: 0x8d2b57,
      roughness: 0.38,
      metalness: 0.0,
    }),
  );

  const lemonFlesh = track(
    new THREE.MeshStandardMaterial({
      color: 0xf4cf48,
      roughness: 0.35,
      metalness: 0.0,
    }),
  );

  const pancakeCrumb = track(
    new THREE.MeshStandardMaterial({
      map: textures.pancakeColor,
      roughness: 0.72,
      metalness: 0.0,
    }),
  );

  const butterPat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfbe178,
      roughness: 0.24,
      metalness: 0.0,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    }),
  );

  const mapleSyrup = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x8b3a0e,
      roughness: 0.06,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    }),
  );

  const blueberry = track(
    new THREE.MeshStandardMaterial({
      color: 0x333c66,
      roughness: 0.46,
      metalness: 0.04,
    }),
  );

  const pizzaCrust = track(
    new THREE.MeshStandardMaterial({
      map: textures.dosaColor,
      color: 0xdfb272,
      roughness: 0.78,
      metalness: 0.0,
    }),
  );

  const pizzaCenter = track(
    new THREE.MeshStandardMaterial({
      map: textures.pizzaColor,
      roughness: 0.44,
      metalness: 0.0,
    }),
  );

  const mozzarella = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfaf2de,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
    }),
  );

  const curryGravy = track(
    new THREE.MeshPhysicalMaterial({
      map: textures.curryColor,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.75,
      clearcoatRoughness: 0.14,
    }),
  );

  const makhaniGravy = track(
    new THREE.MeshPhysicalMaterial({
      map: textures.makhaniColor,
      roughness: 0.2,
      metalness: 0.0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    }),
  );

  const paneerCube = track(
    new THREE.MeshStandardMaterial({
      color: 0xf7e7c4,
      roughness: 0.56,
      metalness: 0.0,
    }),
  );

  const biryaniRice = track(
    new THREE.MeshStandardMaterial({
      map: textures.biryaniColor,
      bumpMap: textures.ceramicBump,
      bumpScale: 0.015,
      roughness: 0.66,
      metalness: 0.0,
    }),
  );

  const crispyOnion = track(
    new THREE.MeshStandardMaterial({
      color: 0x7c3413,
      roughness: 0.62,
      metalness: 0.0,
    }),
  );

  const palakGravy = track(
    new THREE.MeshPhysicalMaterial({
      map: textures.palakColor,
      roughness: 0.26,
      metalness: 0.0,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
    }),
  );

  const idliCake = track(
    new THREE.MeshStandardMaterial({
      map: textures.ceramicBump,
      color: 0xf8f6ef,
      roughness: 0.82,
      metalness: 0.0,
    }),
  );

  const bhaturaBread = track(
    new THREE.MeshStandardMaterial({
      map: textures.pancakeColor,
      color: 0xeac27a,
      roughness: 0.68,
      metalness: 0.0,
    }),
  );

  const choleGravy = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x522a16,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    }),
  );

  const parathaBread = track(
    new THREE.MeshStandardMaterial({
      map: textures.pancakeColor,
      color: 0xe2b169,
      roughness: 0.72,
      metalness: 0.0,
    }),
  );

  const whiteButter = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfdf9ea,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
    }),
  );

  const mangoPickle = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xb23615,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    }),
  );

  const chickpea = track(
    new THREE.MeshStandardMaterial({
      color: 0xd29a4f,
      roughness: 0.56,
      metalness: 0.0,
    }),
  );

  const basmatiRice = track(
    new THREE.MeshStandardMaterial({
      color: 0xf7f5ee,
      roughness: 0.72,
      metalness: 0.0,
    }),
  );

  const naanBread = track(
    new THREE.MeshStandardMaterial({
      map: textures.pancakeColor,
      color: 0xf2dcb5,
      roughness: 0.8,
      metalness: 0.0,
    }),
  );

  const pohaFlake = track(
    new THREE.MeshStandardMaterial({
      color: 0xe9be3d,
      roughness: 0.72,
      metalness: 0.0,
    }),
  );

  const avocadoMash = track(
    new THREE.MeshStandardMaterial({
      color: 0x76a244,
      roughness: 0.65,
      metalness: 0.0,
    }),
  );

  const poachedEggWhite = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfcfaf4,
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.18,
    }),
  );

  const eggYolk = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf49d1e,
      roughness: 0.14,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    }),
  );

  const rajmaGravy = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x7d291b,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
    }),
  );

  const hummusCream = track(
    new THREE.MeshStandardMaterial({
      color: 0xe6d3a7,
      roughness: 0.56,
      metalness: 0.0,
    }),
  );

  const dalMakhaniGravy = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x452216,
      roughness: 0.2,
      metalness: 0.0,
      clearcoat: 0.82,
      clearcoatRoughness: 0.12,
    }),
  );

  const risottoGrain = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xeadcbc,
      roughness: 0.35,
      metalness: 0.0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.16,
    }),
  );

  const creminiMushroom = track(
    new THREE.MeshStandardMaterial({
      color: 0x73523a,
      roughness: 0.48,
      metalness: 0.0,
    }),
  );

  const tamarindGlaze = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x5c1d10,
      roughness: 0.1,
      metalness: 0.0,
      clearcoat: 0.95,
      clearcoatRoughness: 0.06,
    }),
  );

  const gulabSyrup = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc8741c,
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: 0.88,
    }),
  );

  const gulabBall = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x8f4118,
      roughness: 0.26,
      metalness: 0.0,
      clearcoat: 0.72,
      clearcoatRoughness: 0.12,
    }),
  );

  const mangoPuree = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf2a126,
      roughness: 0.18,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    }),
  );

  const pistachioCrumb = track(
    new THREE.MeshStandardMaterial({
      color: 0x87aa4e,
      roughness: 0.65,
      metalness: 0.0,
    }),
  );

  const cocoaDust = track(
    new THREE.MeshStandardMaterial({
      color: 0x452719,
      roughness: 0.92,
      metalness: 0.0,
    }),
  );

  const espressoSponge = track(
    new THREE.MeshStandardMaterial({
      color: 0x6f4a32,
      roughness: 0.82,
      metalness: 0.0,
    }),
  );

  const bellPepperRed = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc92b1d,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    }),
  );

  const clearGlass = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fbfc,
      roughness: 0.08,
      metalness: 0.02,
      transmission: 0.72,
      transparent: true,
      opacity: 0.42,
      clearcoat: 1.0,
    }),
  );

  const saffronMilk = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf6de97,
      roughness: 0.16,
      metalness: 0.0,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
    }),
  );

  const gajarHalwa = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xdc581e,
      roughness: 0.34,
      metalness: 0.0,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
    }),
  );

  const moltenChocolate = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x381d13,
      roughness: 0.12,
      metalness: 0.02,
      clearcoat: 0.92,
      clearcoatRoughness: 0.08,
    }),
  );

  const chaiTea = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc28a58,
      roughness: 0.18,
      metalness: 0.0,
      clearcoat: 0.78,
      clearcoatRoughness: 0.12,
    }),
  );

  const limeJuice = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xdbeeb6,
      roughness: 0.12,
      metalness: 0.0,
      transparent: true,
      opacity: 0.78,
      clearcoat: 0.9,
    }),
  );

  const matchaGreen = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x4b8736,
      roughness: 0.24,
      metalness: 0.0,
      clearcoat: 0.65,
    }),
  );

  const oatMilk = track(
    new THREE.MeshStandardMaterial({
      color: 0xf4efe2,
      roughness: 0.35,
      metalness: 0.0,
    }),
  );

  const raspberryFruit = track(
    new THREE.MeshStandardMaterial({
      color: 0xb61c39,
      roughness: 0.56,
      metalness: 0.0,
    }),
  );

  const rosePetal = track(
    new THREE.MeshStandardMaterial({
      color: 0xc8456c,
      roughness: 0.6,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  );

  const contactShadow = track(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    }),
  );

  const applyVesselFinish = (preset: VesselFinishPreset) => {
    if (preset === 'ceramic') {
      vesselPrimary.map = textures.ceramicColor;
      vesselPrimary.color.setHex(0xf6f1e6);
      vesselPrimary.roughness = 0.52;
      vesselPrimary.metalness = 0.04;
      vesselPrimary.clearcoat = 0.35;
    } else if (preset === 'slate') {
      vesselPrimary.map = textures.slateColor;
      vesselPrimary.color.setHex(0x474c4a);
      vesselPrimary.roughness = 0.78;
      vesselPrimary.metalness = 0.06;
      vesselPrimary.clearcoat = 0.08;
    } else if (preset === 'copper') {
      vesselPrimary.map = null;
      vesselPrimary.color.setHex(0xc87447);
      vesselPrimary.roughness = 0.24;
      vesselPrimary.metalness = 0.9;
      vesselPrimary.clearcoat = 0.25;
    }
    vesselPrimary.needsUpdate = true;
  };

  return {
    tableWood,
    turntableRim,
    vesselPrimary,
    vesselAccent,
    terracottaClay,
    stainlessSteel,
    brushedBrass,
    carvedWood,
    linenCloth,
    pastaRibbon,
    creamSauce,
    garlicClove,
    parmesanFlake,
    herbLeaf,
    pepperGrain,
    dosaShell,
    potatoMasala,
    coconutChutney,
    sambarBroth,
    tomatoChutney,
    lettuceLeaf,
    cucumberSlice,
    cherryTomato,
    redOnion,
    lemonFlesh,
    pancakeCrumb,
    butterPat,
    mapleSyrup,
    blueberry,
    pizzaCrust,
    pizzaCenter,
    mozzarella,
    curryGravy,
    makhaniGravy,
    paneerCube,
    biryaniRice,
    crispyOnion,
    palakGravy,
    idliCake,
    bhaturaBread,
    choleGravy,
    parathaBread,
    whiteButter,
    mangoPickle,
    chickpea,
    basmatiRice,
    naanBread,
    pohaFlake,
    avocadoMash,
    poachedEggWhite,
    eggYolk,
    rajmaGravy,
    hummusCream,
    dalMakhaniGravy,
    risottoGrain,
    creminiMushroom,
    tamarindGlaze,
    gulabSyrup,
    gulabBall,
    mangoPuree,
    pistachioCrumb,
    cocoaDust,
    espressoSponge,
    bellPepperRed,
    clearGlass,
    saffronMilk,
    gajarHalwa,
    moltenChocolate,
    chaiTea,
    limeJuice,
    matchaGreen,
    oatMilk,
    raspberryFruit,
    rosePetal,
    contactShadow,
    applyVesselFinish,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
