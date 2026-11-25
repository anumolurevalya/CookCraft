import * as THREE from 'three';
import type { DishModelKey, Recipe } from '../data/recipes';
import type { CulinaryMaterialLibrary } from './materials';

export type DishKey = DishModelKey | 'custom';

export interface DishAssembly {
  root: THREE.Group;
  explodableParts: THREE.Object3D[];
  dispose: () => void;
}

function registerPart(
  parent: THREE.Object3D,
  part: THREE.Object3D,
  label: string,
  explodeOffset: number,
  explodableParts: THREE.Object3D[],
) {
  part.userData.baseY = part.position.y;
  part.userData.explodeOffset = explodeOffset;
  part.userData.partLabel = label;
  part.traverse((child) => {
    child.userData.partLabel = label;
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  parent.add(part);
  explodableParts.push(part);
}

function createLeafGeometry(scale = 1): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.08 * scale, 0.06 * scale, 0.09 * scale, 0.16 * scale, 0, 0.24 * scale);
  shape.bezierCurveTo(-0.09 * scale, 0.16 * scale, -0.08 * scale, 0.06 * scale, 0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.006 * scale,
    bevelEnabled: true,
    bevelThickness: 0.003 * scale,
    bevelSize: 0.003 * scale,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createLatheBowlGeometry(
  outerRadius: number,
  height: number,
  wall = 0.055,
  footRadius = 0.42,
): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(footRadius, 0),
    new THREE.Vector2(footRadius + 0.04, 0.05),
    new THREE.Vector2(outerRadius * 0.78, height * 0.35),
    new THREE.Vector2(outerRadius, height),
    new THREE.Vector2(outerRadius - wall, height),
    new THREE.Vector2(outerRadius * 0.72, height * 0.35),
    new THREE.Vector2(footRadius * 0.75, 0.075),
    new THREE.Vector2(0, 0.065),
  ];
  return new THREE.LatheGeometry(pts, 48);
}

function createLathePlateGeometry(radius: number, rimHeight = 0.12): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(radius * 0.62, 0),
    new THREE.Vector2(radius * 0.76, 0.025),
    new THREE.Vector2(radius, rimHeight),
    new THREE.Vector2(radius - 0.035, rimHeight + 0.012),
    new THREE.Vector2(radius * 0.74, 0.05),
    new THREE.Vector2(0, 0.045),
  ];
  return new THREE.LatheGeometry(pts, 48);
}

function createLatheHandiGeometry(radius: number, height: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(radius * 0.55, 0),
    new THREE.Vector2(radius * 0.92, height * 0.25),
    new THREE.Vector2(radius, height * 0.52),
    new THREE.Vector2(radius * 0.84, height * 0.82),
    new THREE.Vector2(radius * 0.9, height),
    new THREE.Vector2(radius * 0.84, height),
    new THREE.Vector2(radius * 0.78, height * 0.8),
    new THREE.Vector2(radius * 0.92, height * 0.52),
    new THREE.Vector2(radius * 0.5, 0.08),
    new THREE.Vector2(0, 0.07),
  ];
  return new THREE.LatheGeometry(pts, 48);
}

function createNaanGeometry(
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.ExtrudeGeometry {
  const naanShape = new THREE.Shape();
  naanShape.moveTo(0, -0.45);
  naanShape.bezierCurveTo(0.35, -0.35, 0.42, 0.15, 0.14, 0.55);
  naanShape.bezierCurveTo(0.02, 0.65, -0.08, 0.62, -0.22, 0.45);
  naanShape.bezierCurveTo(-0.38, 0.15, -0.32, -0.35, 0, -0.45);
  const geo = trackGeo(
    new THREE.ExtrudeGeometry(naanShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    }),
  );
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createCreamSwirlGeometry(
  radius: number,
  turns: number,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const steps = 42;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const r = 0.06 + t * radius;
    pts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
  }
  return trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 54, 0.016, 8, false));
}

function createForkGroup(
  mat: THREE.Material,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.Group {
  const group = new THREE.Group();
  const handleShape = new THREE.Shape();
  handleShape.moveTo(-0.022, 0);
  handleShape.lineTo(0.022, 0);
  handleShape.lineTo(0.015, 0.78);
  handleShape.lineTo(-0.015, 0.78);
  handleShape.closePath();

  const handleGeo = trackGeo(
    new THREE.ExtrudeGeometry(handleShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
    }),
  );
  handleGeo.rotateX(-Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, mat);
  group.add(handle);

  const neckGeo = trackGeo(new THREE.BoxGeometry(0.09, 0.016, 0.06));
  const neck = new THREE.Mesh(neckGeo, mat);
  neck.position.set(0, 0.01, -0.8);
  group.add(neck);

  const tineGeo = trackGeo(new THREE.BoxGeometry(0.012, 0.014, 0.24));
  for (let i = -1.5; i <= 1.5; i += 1) {
    const tine = new THREE.Mesh(tineGeo, mat);
    tine.position.set(i * 0.024, 0.01, -0.94);
    group.add(tine);
  }
  return group;
}

function createSpoonGroup(
  mat: THREE.Material,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.Group {
  const group = new THREE.Group();
  const handleGeo = trackGeo(new THREE.CylinderGeometry(0.014, 0.02, 0.85, 16));
  handleGeo.rotateX(Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, mat);
  handle.position.set(0, 0.02, 0.28);
  group.add(handle);

  const bowlGeo = trackGeo(
    new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
  );
  bowlGeo.scale(0.85, 0.45, 1.3);
  bowlGeo.rotateX(Math.PI);
  const bowl = new THREE.Mesh(bowlGeo, mat);
  bowl.position.set(0, 0.045, -0.2);
  group.add(bowl);
  return group;
}

export function resolveDishKey(recipe: Recipe): DishKey {
  if (recipe.dishModelKey) return recipe.dishModelKey;
  const lower = recipe.name.toLowerCase();
  if (lower.includes('paneer butter') || lower.includes('makhani butter')) return 'paneer_butter_masala';
  if (lower.includes('dal makhani') || lower.includes('makhani')) return 'dal_makhani';
  if (lower.includes('biryani')) return 'biryani';
  if (lower.includes('idli')) return 'idli_sambar';
  if (lower.includes('chole') || lower.includes('bhature')) return 'chole_bhature';
  if (lower.includes('palak') || lower.includes('saag')) return 'palak_paneer';
  if (lower.includes('paratha')) return 'aloo_paratha';
  if (lower.includes('poha')) return 'poha';
  if (lower.includes('avocado') || lower.includes('toast')) return 'avocado_toast';
  if (lower.includes('rajma')) return 'rajma_chawal';
  if (lower.includes('falafel') || lower.includes('mezze') || lower.includes('hummus')) return 'falafel_bowl';
  if (lower.includes('risotto')) return 'risotto';
  if (lower.includes('samosa') || lower.includes('chaat')) return 'samosa_chaat';
  if (lower.includes('gulab') || lower.includes('jamun')) return 'gulab_jamun';
  if (lower.includes('pav bhaji') || lower.includes('bhaji')) return 'pav_bhaji';
  if (lower.includes('tikka') || lower.includes('skewer')) return 'paneer_tikka';
  if (lower.includes('lassi') || lower.includes('mango')) return 'mango_lassi';
  if (lower.includes('tiramisu')) return 'tiramisu';
  if (lower.includes('rasmalai')) return 'rasmalai';
  if (lower.includes('halwa') || lower.includes('gajar')) return 'gajar_halwa';
  if (lower.includes('lava') || lower.includes('chocolate cake')) return 'lava_cake';
  if (lower.includes('chai')) return 'masala_chai';
  if (lower.includes('nimbu') || lower.includes('limeade')) return 'nimbu_pani';
  if (lower.includes('matcha')) return 'matcha_latte';
  if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('noodle')) return 'pasta';
  if (lower.includes('dosa') || lower.includes('crepe')) return 'dosa';
  if (lower.includes('salad') || lower.includes('bowl')) return 'salad';
  if (lower.includes('pancake') || lower.includes('waffle')) return 'pancakes';
  if (lower.includes('pizza') || lower.includes('flatbread')) return 'pizza';
  if (lower.includes('curry') || lower.includes('masala') || lower.includes('stew')) return 'curry';
  return 'custom';
}

export function buildDishModel(
  recipe: Recipe,
  materials: CulinaryMaterialLibrary,
): DishAssembly {
  const root = new THREE.Group();
  const explodableParts: THREE.Object3D[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // Contact shadow grounding plane flush above table
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(3.2, 3.2));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowPlane = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowPlane.position.y = 0.003;
  shadowPlane.receiveShadow = false;
  shadowPlane.castShadow = false;
  root.add(shadowPlane);

  const key = resolveDishKey(recipe);

  if (key === 'pasta') {
    const bowlGeo = trackGeo(createLatheBowlGeometry(1.18, 0.48, 0.06, 0.56));
    const bowl = new THREE.Mesh(bowlGeo, materials.vesselPrimary);
    registerPart(root, bowl, 'Handmade Ceramic Pasta Bowl', 0, explodableParts);

    const sauceGeo = trackGeo(new THREE.CylinderGeometry(0.86, 0.72, 0.08, 40));
    const sauce = new THREE.Mesh(sauceGeo, materials.creamSauce);
    sauce.position.y = 0.14;
    registerPart(root, sauce, 'Roasted Garlic Cream Sauce', 0.25, explodableParts);

    const pastaGroup = new THREE.Group();
    pastaGroup.position.y = 0.22;
    for (let strand = 0; strand < 5; strand++) {
      const pts: THREE.Vector3[] = [];
      const phase = (strand / 5) * Math.PI * 2;
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const angle = phase + t * Math.PI * 4.2;
        const r = 0.16 + 0.48 * Math.sin(t * Math.PI) + Math.sin(t * 9 + strand) * 0.06;
        const y = 0.05 + Math.sin(t * Math.PI) * 0.22 + (strand % 2) * 0.03;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const tubeGeo = trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.036, 10, false));
      pastaGroup.add(new THREE.Mesh(tubeGeo, materials.pastaRibbon));
    }
    registerPart(root, pastaGroup, 'Twirled Fettuccine Ribbons', 0.55, explodableParts);

    const garlicGroup = new THREE.Group();
    garlicGroup.position.y = 0.42;
    const cloveGeo = trackGeo(new THREE.SphereGeometry(0.075, 18, 14));
    cloveGeo.scale(1.3, 0.72, 0.85);
    [
      [-0.18, 0.03, 0.12, 0.3],
      [0.2, 0.04, -0.08, -0.5],
      [0.02, 0.07, 0.22, 1.1],
      [-0.08, 0.05, -0.2, 0.8],
    ].forEach(([x, y, z, rot]) => {
      const clove = new THREE.Mesh(cloveGeo, materials.garlicClove);
      clove.position.set(x, y, z);
      clove.rotation.set(0.2, rot, 0.1);
      garlicGroup.add(clove);
    });
    registerPart(root, garlicGroup, 'Caramelized Roasted Garlic Cloves', 0.85, explodableParts);

    const garnishGroup = new THREE.Group();
    garnishGroup.position.y = 0.46;
    const leafGeo = trackGeo(createLeafGeometry(1.1));
    [
      [0.05, 0.07, 0.02, 0.4],
      [-0.22, 0.04, -0.05, 2.2],
      [0.18, 0.03, 0.21, -1.2],
      [-0.05, 0.06, -0.18, 1.6],
    ].forEach(([x, y, z, rot]) => {
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(x, y, z);
      leaf.rotation.set(0.25, rot, 0.12);
      garnishGroup.add(leaf);
    });
    const parmGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.012, 0.06));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const flake = new THREE.Mesh(parmGeo, materials.parmesanFlake);
      flake.position.set(Math.cos(a) * 0.24, 0.04 + (i % 2) * 0.03, Math.sin(a) * 0.24);
      flake.rotation.set(0.4, a, 0.3);
      garnishGroup.add(flake);
    }
    registerPart(root, garnishGroup, 'Fresh Basil & Shaved Parmesan', 1.15, explodableParts);

    const pepperGeo = trackGeo(new THREE.DodecahedronGeometry(0.013, 0));
    const pepperInst = new THREE.InstancedMesh(pepperGeo, materials.pepperGrain, 32);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 32; i++) {
      const angle = i * 2.39996;
      const rad = 0.08 + Math.sqrt(i / 32) * 0.46;
      dummy.position.set(Math.cos(angle) * rad, 0.47 + ((i * 7) % 5) * 0.015, Math.sin(angle) * rad);
      dummy.rotation.set(i, i * 0.5, 0);
      dummy.scale.setScalar(0.85 + (i % 3) * 0.2);
      dummy.updateMatrix();
      pepperInst.setMatrixAt(i, dummy.matrix);
    }
    pepperInst.instanceMatrix.needsUpdate = true;
    pepperInst.computeBoundingSphere();
    registerPart(root, pepperInst, 'Cracked Tellicherry Pepper', 1.32, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.22, 0.02, 0.36);
    fork.rotation.y = -0.25;
    registerPart(root, fork, 'Brushed Steel Dinner Fork', 0.15, explodableParts);
  } else if (key === 'dosa') {
    const platterGeo = trackGeo(createLathePlateGeometry(1.36, 0.12));
    registerPart(root, new THREE.Mesh(platterGeo, materials.vesselPrimary), 'Stoneware Thali Platter', 0, explodableParts);

    const masalaGeo = trackGeo(new THREE.CapsuleGeometry(0.16, 0.72, 8, 16));
    masalaGeo.rotateZ(Math.PI / 2);
    const masala = new THREE.Mesh(masalaGeo, materials.potatoMasala);
    masala.position.set(-0.08, 0.19, 0.18);
    masala.rotation.y = 0.22;
    registerPart(root, masala, 'Spiced Turmeric Potato Masala', 0.42, explodableParts);

    const dosaGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.31, 1.56, 36, 1, true));
    dosaGeo.rotateZ(Math.PI / 2);
    const dosa = new THREE.Mesh(dosaGeo, materials.dosaShell);
    dosa.position.set(-0.06, 0.26, 0.18);
    dosa.rotation.y = 0.22;
    registerPart(root, dosa, 'Crispy Fermented Masala Dosa', 0.72, explodableParts);

    const katoriGeo = trackGeo(createLatheBowlGeometry(0.27, 0.2, 0.022, 0.16));
    [
      { x: -0.64, z: -0.52, mat: materials.coconutChutney, label: 'Coconut Chutney Katori' },
      { x: 0.02, z: -0.66, mat: materials.sambarBroth, label: 'Lentil Sambar Katori' },
      { x: 0.66, z: -0.42, mat: materials.tomatoChutney, label: 'Spiced Tomato Chutney Katori' },
    ].forEach((item, idx) => {
      const katoriGroup = new THREE.Group();
      katoriGroup.position.set(item.x, 0.05, item.z);
      katoriGroup.add(new THREE.Mesh(katoriGeo, materials.stainlessSteel));
      const fill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.23, 0.18, 0.05, 28)), item.mat);
      fill.position.y = 0.14;
      katoriGroup.add(fill);
      registerPart(root, katoriGroup, item.label, 0.25 + idx * 0.12, explodableParts);
    });

    const curryGroup = new THREE.Group();
    curryGroup.position.set(-0.05, 0.51, 0.18);
    const leafGeo = trackGeo(createLeafGeometry(0.75));
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set((i - 2) * 0.09, 0.02, (i % 2) * 0.05);
      leaf.rotation.set(0.2, i * 0.7, 0.1);
      curryGroup.add(leaf);
    }
    registerPart(root, curryGroup, 'Fresh Tempered Curry Leaves', 1.0, explodableParts);

    const seedGeo = trackGeo(new THREE.SphereGeometry(0.011, 8, 6));
    const seedInst = new THREE.InstancedMesh(seedGeo, materials.pepperGrain, 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      const a = i * 2.4;
      const r = 0.04 + (i % 6) * 0.028;
      dummy.position.set(-0.64 + Math.cos(a) * r, 0.22, -0.52 + Math.sin(a) * r);
      dummy.updateMatrix();
      seedInst.setMatrixAt(i, dummy.matrix);
    }
    seedInst.instanceMatrix.needsUpdate = true;
    seedInst.computeBoundingSphere();
    registerPart(root, seedInst, 'Crackled Mustard Seed Tempering', 0.65, explodableParts);

    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(1.24, 0.02, 0.28);
    spoon.rotation.y = -0.35;
    registerPart(root, spoon, 'Handcrafted Brass Spoon', 0.15, explodableParts);
  } else if (key === 'paneer_butter_masala') {
    // 1. Hammered Brass Kadai Serving Pot
    const kadaiGroup = new THREE.Group();
    kadaiGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.95, 0.54, 0.045, 0.48)), materials.brushedBrass));
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.44, -0.18),
      new THREE.Vector3(0.22, 0.56, 0),
      new THREE.Vector3(0, 0.44, 0.18),
    ]);
    const handleGeo = trackGeo(new THREE.TubeGeometry(handleCurve, 20, 0.025, 10, false));
    const leftHandle = new THREE.Mesh(handleGeo, materials.brushedBrass);
    leftHandle.position.x = -0.92;
    leftHandle.rotation.y = Math.PI;
    const rightHandle = new THREE.Mesh(handleGeo, materials.brushedBrass);
    rightHandle.position.x = 0.92;
    kadaiGroup.add(leftHandle, rightHandle);
    registerPart(root, kadaiGroup, 'Hammered Copper-Brass Kadai', 0, explodableParts);

    // 2. Velvety Makhani Tomato-Butter Gravy
    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.76, 0.6, 0.12, 40)), materials.makhaniGravy);
    gravy.position.y = 0.34;
    registerPart(root, gravy, 'Velvety Tomato-Cashew Makhani Gravy', 0.3, explodableParts);

    // 3. Golden Seared Paneer Cubes
    const paneerGroup = new THREE.Group();
    paneerGroup.position.y = 0.41;
    const cubeGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.11, 0.15));
    [
      [-0.28, 0.02, 0.14, 0.3],
      [0.24, 0.03, -0.18, -0.5],
      [0.02, 0.04, 0.04, 0.8],
      [-0.14, 0.02, -0.32, 0.2],
      [0.34, 0.02, 0.22, -0.3],
      [-0.38, 0.02, -0.12, 0.6],
      [0.06, 0.02, 0.36, -0.8],
    ].forEach(([x, y, z, rot]) => {
      const cube = new THREE.Mesh(cubeGeo, materials.paneerCube);
      cube.position.set(x, y, z);
      cube.rotation.set(0.1, rot, 0.06);
      paneerGroup.add(cube);
    });
    registerPart(root, paneerGroup, 'Golden Seared Paneer Cubes', 0.62, explodableParts);

    // 4. Fresh Cream Swirl Ribbon
    const swirl = new THREE.Mesh(createCreamSwirlGeometry(0.42, 1.8, trackGeo), materials.whiteButter);
    swirl.position.y = 0.43;
    registerPart(root, swirl, 'Fresh Cream Makhani Swirl', 0.88, explodableParts);

    // 5. Instanced Kasuri Methi (Fenugreek) Flakes
    const methiGeo = trackGeo(new THREE.DodecahedronGeometry(0.015, 0));
    const methiInst = new THREE.InstancedMesh(methiGeo, materials.herbLeaf, 28);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 28; i++) {
      const a = i * 2.39996;
      const r = 0.06 + Math.sqrt(i / 28) * 0.56;
      dummy.position.set(Math.cos(a) * r, 0.44 + (i % 3) * 0.015, Math.sin(a) * r);
      dummy.scale.set(1.4, 0.5, 0.9);
      dummy.updateMatrix();
      methiInst.setMatrixAt(i, dummy.matrix);
    }
    methiInst.instanceMatrix.needsUpdate = true;
    methiInst.computeBoundingSphere();
    registerPart(root, methiInst, 'Crushed Kasuri Methi Leaves', 1.12, explodableParts);

    // 6. Garlic Butter Naan Side
    const naan = new THREE.Mesh(createNaanGeometry(trackGeo), materials.naanBread);
    naan.position.set(1.14, 0.02, 0.42);
    naan.rotation.y = -0.4;
    registerPart(root, naan, 'Garlic Butter Tandoori Naan', 0.25, explodableParts);

    // 7. Brass Serving Spoon
    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(-1.18, 0.02, 0.38);
    spoon.rotation.y = 0.35;
    registerPart(root, spoon, 'Handcrafted Brass Spoon', 0.16, explodableParts);
  } else if (key === 'biryani') {
    // 1. Clay Dum Handi Pot
    const handiGroup = new THREE.Group();
    handiGroup.add(new THREE.Mesh(trackGeo(createLatheHandiGeometry(0.96, 0.72)), materials.terracottaClay));
    registerPart(root, handiGroup, 'Traditional Clay Dum Handi', 0, explodableParts);

    // 2. Saffron & White Basmati Rice Mound
    const riceMoundGeo = trackGeo(new THREE.SphereGeometry(0.82, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.48));
    riceMoundGeo.scale(1, 0.45, 1);
    const riceMound = new THREE.Mesh(riceMoundGeo, materials.biryaniRice);
    riceMound.position.y = 0.42;
    registerPart(root, riceMound, 'Saffron-Layered Basmati Rice', 0.36, explodableParts);

    // 3. Crispy Caramelized Onion Rings & Mint Leaves
    const topGroup = new THREE.Group();
    topGroup.position.y = 0.72;
    const onionGeo = trackGeo(new THREE.TorusGeometry(0.14, 0.016, 8, 22, Math.PI * 1.3));
    onionGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const ring = new THREE.Mesh(onionGeo, materials.crispyOnion);
      ring.position.set(Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.26);
      ring.rotation.set(0.2, a, 0.15);
      topGroup.add(ring);
    }
    const mintGeo = trackGeo(createLeafGeometry(0.95));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(mintGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12);
      leaf.rotation.set(0.25, a, 0.1);
      topGroup.add(leaf);
    }
    registerPart(root, topGroup, 'Crispy Birista Onions & Fresh Mint', 0.75, explodableParts);

    // 4. Instanced Saffron Strands & Roasted Cashews
    const saffronGeo = trackGeo(new THREE.SphereGeometry(0.024, 10, 8));
    const saffronInst = new THREE.InstancedMesh(saffronGeo, materials.potatoMasala, 26);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996;
      const r = 0.06 + Math.sqrt(i / 26) * 0.52;
      dummy.position.set(Math.cos(a) * r, 0.74 - r * 0.18, Math.sin(a) * r);
      dummy.scale.set(1.6, 0.45, 0.55);
      dummy.rotation.set(0, a, 0.2);
      dummy.updateMatrix();
      saffronInst.setMatrixAt(i, dummy.matrix);
    }
    saffronInst.instanceMatrix.needsUpdate = true;
    saffronInst.computeBoundingSphere();
    registerPart(root, saffronInst, 'Infused Saffron Strands & Cashews', 1.05, explodableParts);

    // 5. Tilted Dum Metal Lid
    const lidGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.84, 0.14, 36));
    const lid = new THREE.Mesh(lidGeo, materials.stainlessSteel);
    lid.position.set(-0.78, 0.84, -0.62);
    lid.rotation.set(0.55, 0.4, -0.45);
    registerPart(root, lid, 'Brushed Steel Dum Lid', 0.9, explodableParts);

    // 6. Side Bowl of Cucumber Mint Raita
    const raitaGroup = new THREE.Group();
    raitaGroup.position.set(1.06, 0.01, 0.56);
    raitaGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.38, 0.24, 0.03, 0.2)), materials.vesselPrimary));
    const raitaFill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.33, 0.26, 0.06, 28)), materials.coconutChutney);
    raitaFill.position.y = 0.16;
    raitaGroup.add(raitaFill);
    registerPart(root, raitaGroup, 'Cool Cucumber Mint Raita', 0.22, explodableParts);
  } else if (key === 'idli_sambar') {
    // 1. Dark Stoneware Platter
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.36, 0.12)), materials.vesselAccent);
    registerPart(root, plate, 'Matte Stoneware Breakfast Platter', 0, explodableParts);

    // 2. Four Fluffy Steamed Idli Rice Cakes
    const idliGroup = new THREE.Group();
    idliGroup.position.set(0.18, 0.08, 0.34);
    const idliGeo = trackGeo(new THREE.SphereGeometry(0.28, 28, 18));
    idliGeo.scale(1, 0.46, 1);
    [
      [-0.32, 0.08, 0.12],
      [0.24, 0.08, 0.16],
      [-0.08, 0.08, -0.32],
      [0.42, 0.08, -0.26],
    ].forEach(([x, y, z]) => {
      const cake = new THREE.Mesh(idliGeo, materials.idliCake);
      cake.position.set(x, y, z);
      idliGroup.add(cake);
    });
    registerPart(root, idliGroup, 'Fluffy Steamed Fermented Idlis', 0.42, explodableParts);

    // 3. Instanced Milagai Podi Spice Dusting
    const podiGeo = trackGeo(new THREE.DodecahedronGeometry(0.012, 0));
    const podiInst = new THREE.InstancedMesh(podiGeo, materials.tomatoChutney, 32);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 32; i++) {
      const cakeIdx = i % 4;
      const centers = [
        [-0.14, 0.46],
        [0.42, 0.5],
        [0.1, 0.02],
        [0.6, 0.08],
      ][cakeIdx];
      const a = i * 2.4;
      const r = (i % 5) * 0.032;
      dummy.position.set(centers[0] + Math.cos(a) * r, 0.28, centers[1] + Math.sin(a) * r);
      dummy.updateMatrix();
      podiInst.setMatrixAt(i, dummy.matrix);
    }
    podiInst.instanceMatrix.needsUpdate = true;
    podiInst.computeBoundingSphere();
    registerPart(root, podiInst, 'Ghee & Gunpowder Podi Spice', 0.78, explodableParts);

    // 4. Three Steel Katori Bowls (Sambar, Coconut Chutney, Tomato Chutney)
    const katoriGeo = trackGeo(createLatheBowlGeometry(0.29, 0.22, 0.022, 0.17));
    [
      { x: -0.68, z: -0.26, mat: materials.sambarBroth, label: 'Hot Vegetable Drumstick Sambar' },
      { x: -0.14, z: -0.68, mat: materials.coconutChutney, label: 'Tempered Coconut Chutney' },
      { x: 0.54, z: -0.62, mat: materials.tomatoChutney, label: 'Roasted Tomato Chutney' },
    ].forEach((item, idx) => {
      const katoriGroup = new THREE.Group();
      katoriGroup.position.set(item.x, 0.05, item.z);
      katoriGroup.add(new THREE.Mesh(katoriGeo, materials.stainlessSteel));
      const fill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.25, 0.2, 0.05, 28)), item.mat);
      fill.position.y = 0.16;
      katoriGroup.add(fill);
      registerPart(root, katoriGroup, item.label, 0.25 + idx * 0.12, explodableParts);
    });

    // 5. Brass Spoon
    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(-1.18, 0.02, 0.25);
    spoon.rotation.y = 0.28;
    registerPart(root, spoon, 'Handcrafted Brass Spoon', 0.16, explodableParts);
  } else if (key === 'chole_bhature') {
    // 1. Brass-Rimmed Thali Platter
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.38, 0.12)), materials.brushedBrass);
    registerPart(root, plate, 'Hammered Brass Punjabi Thali', 0, explodableParts);

    // 2. Two Golden Puffed Fried Bhature Breads
    const bhatureGroup = new THREE.Group();
    bhatureGroup.position.set(-0.34, 0.22, -0.06);
    const bhatGeo = trackGeo(new THREE.SphereGeometry(0.46, 28, 20));
    bhatGeo.scale(1.12, 0.42, 0.96);
    const b1 = new THREE.Mesh(bhatGeo, materials.bhaturaBread);
    b1.position.set(-0.18, 0.04, 0.16);
    b1.rotation.set(0.08, 0.2, -0.12);
    const b2 = new THREE.Mesh(bhatGeo, materials.bhaturaBread);
    b2.position.set(0.22, 0.12, -0.24);
    b2.rotation.set(-0.15, -0.3, 0.16);
    bhatureGroup.add(b1, b2);
    registerPart(root, bhatureGroup, 'Golden Puffed Bhature Breads', 0.42, explodableParts);

    // 3. Stoneware Bowl of Dark Spiced Chole
    const choleGroup = new THREE.Group();
    choleGroup.position.set(0.54, 0.06, 0.12);
    choleGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.48, 0.34, 0.035, 0.26)), materials.vesselPrimary));
    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.41, 0.34, 0.08, 32)), materials.choleGravy);
    gravy.position.y = 0.22;
    choleGroup.add(gravy);
    registerPart(root, choleGroup, 'Spiced Pindi Chole Masala', 0.28, explodableParts);

    // 4. Instanced Chole Chickpeas
    const peaGeo = trackGeo(new THREE.SphereGeometry(0.038, 12, 10));
    const peaInst = new THREE.InstancedMesh(peaGeo, materials.chickpea, 28);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 28; i++) {
      const a = i * 2.39996;
      const r = 0.04 + Math.sqrt(i / 28) * 0.34;
      dummy.position.set(0.54 + Math.cos(a) * r, 0.31 + (i % 3) * 0.012, 0.12 + Math.sin(a) * r);
      dummy.updateMatrix();
      peaInst.setMatrixAt(i, dummy.matrix);
    }
    peaInst.instanceMatrix.needsUpdate = true;
    peaInst.computeBoundingSphere();
    registerPart(root, peaInst, 'Tender Spiced Kabuli Chickpeas', 0.65, explodableParts);

    // 5. Pickled Red Onion Rings & Lemon Wedge
    const sideGroup = new THREE.Group();
    sideGroup.position.set(-0.24, 0.08, 0.72);
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.11, 0.015, 8, 22));
    ringGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(ringGeo, materials.redOnion);
      ring.position.set((i - 1.5) * 0.09, 0.02 + i * 0.006, (i % 2) * 0.06);
      sideGroup.add(ring);
    }
    const lemon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20, 1, false, 0, Math.PI * 0.85)),
      materials.lemonFlesh,
    );
    lemon.rotation.z = Math.PI / 2;
    lemon.position.set(0.45, 0.06, -0.08);
    sideGroup.add(lemon);
    registerPart(root, sideGroup, 'Pickled Red Onions & Lemon Wedge', 0.82, explodableParts);

    // 6. Brass Spoon
    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(1.24, 0.02, 0.34);
    spoon.rotation.y = -0.3;
    registerPart(root, spoon, 'Handcrafted Brass Spoon', 0.15, explodableParts);
  } else if (key === 'palak_paneer') {
    // 1. Artisanal Stoneware Bowl
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.06, 0.52, 0.055, 0.52)), materials.vesselPrimary);
    registerPart(root, bowl, 'Artisanal Stoneware Bowl', 0, explodableParts);

    // 2. Smooth Emerald Spinach Gravy
    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.84, 0.68, 0.1, 40)), materials.palakGravy);
    gravy.position.y = 0.3;
    registerPart(root, gravy, 'Spiced Emerald Spinach Puree', 0.28, explodableParts);

    // 3. Seared Paneer Cubes
    const paneerGroup = new THREE.Group();
    paneerGroup.position.y = 0.36;
    const cubeGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.11, 0.16));
    [
      [-0.25, 0.02, 0.16, 0.4],
      [0.24, 0.03, -0.14, -0.3],
      [0.0, 0.04, -0.02, 0.9],
      [-0.12, 0.02, -0.34, 0.2],
      [0.32, 0.02, 0.24, -0.6],
      [-0.34, 0.02, -0.14, 0.7],
    ].forEach(([x, y, z, rot]) => {
      const cube = new THREE.Mesh(cubeGeo, materials.paneerCube);
      cube.position.set(x, y, z);
      cube.rotation.set(0.08, rot, 0.05);
      paneerGroup.add(cube);
    });
    registerPart(root, paneerGroup, 'Golden Seared Paneer Cubes', 0.58, explodableParts);

    // 4. Cream Swirl & Garlic-Cumin Tadka
    const swirl = new THREE.Mesh(createCreamSwirlGeometry(0.46, 1.6, trackGeo), materials.whiteButter);
    swirl.position.y = 0.38;
    registerPart(root, swirl, 'Fresh Cream Swirl', 0.84, explodableParts);

    const cuminGeo = trackGeo(new THREE.SphereGeometry(0.013, 8, 6));
    const cuminInst = new THREE.InstancedMesh(cuminGeo, materials.crispyOnion, 30);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const a = i * 2.39996;
      const r = 0.05 + Math.sqrt(i / 30) * 0.55;
      dummy.position.set(Math.cos(a) * r, 0.39 + (i % 3) * 0.015, Math.sin(a) * r);
      dummy.scale.set(1.8, 0.6, 0.6);
      dummy.rotation.set(0, a, 0);
      dummy.updateMatrix();
      cuminInst.setMatrixAt(i, dummy.matrix);
    }
    cuminInst.instanceMatrix.needsUpdate = true;
    cuminInst.computeBoundingSphere();
    registerPart(root, cuminInst, 'Roasted Cumin & Garlic Tempering', 1.08, explodableParts);

    // 5. Tandoori Roti Side
    const roti = new THREE.Mesh(createNaanGeometry(trackGeo), materials.parathaBread);
    roti.position.set(1.18, 0.02, 0.44);
    roti.rotation.y = -0.35;
    registerPart(root, roti, 'Warm Tandoori Whole-Wheat Roti', 0.24, explodableParts);

    // 6. Vintage Silver Spoon
    const spoon = createSpoonGroup(materials.stainlessSteel, trackGeo);
    spoon.position.set(-1.14, 0.02, 0.34);
    spoon.rotation.y = 0.3;
    registerPart(root, spoon, 'Vintage Steel Spoon', 0.15, explodableParts);
  } else if (key === 'aloo_paratha') {
    // 1. Speckled Ceramic Plate
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.26, 0.11)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Ceramic Breakfast Plate', 0, explodableParts);

    // 2. Stacked Blistered Aloo Parathas
    const parathaGeo = trackGeo(new THREE.CylinderGeometry(0.8, 0.82, 0.055, 40));
    [0.06, 0.125, 0.19].forEach((y, idx) => {
      const p = new THREE.Mesh(parathaGeo, materials.parathaBread);
      p.position.set(idx * 0.02 - 0.02, y + 0.03, idx === 1 ? 0.02 : -0.01);
      p.rotation.y = idx * 0.4;
      registerPart(root, p, `Stuffed Potato Paratha #${idx + 1}`, 0.18 + idx * 0.18, explodableParts);
    });

    // 3. Melting White Makkhan Butter Pat
    const butter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.08, 0.24)), materials.whiteButter);
    butter.position.set(0, 0.28, 0);
    butter.rotation.y = 0.42;
    registerPart(root, butter, 'Cultured White Makkhan Butter', 0.78, explodableParts);

    // 4. Stoneware Bowl of Thick Yogurt Curd + Cumin
    const curdGroup = new THREE.Group();
    curdGroup.position.set(-1.12, 0.01, -0.58);
    curdGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.38, 0.24, 0.03, 0.2)), materials.vesselPrimary));
    const curdFill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.33, 0.26, 0.06, 28)), materials.whiteButter);
    curdFill.position.y = 0.16;
    curdGroup.add(curdFill);
    registerPart(root, curdGroup, 'Cooling Homemade Curd Bowl', 0.24, explodableParts);

    // 5. Small Dish of Spiced Mango Pickle
    const pickleGroup = new THREE.Group();
    pickleGroup.position.set(-1.08, 0.01, 0.56);
    pickleGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.26, 0.14, 0.025, 0.15)), materials.vesselPrimary));
    const pickleFill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.21, 0.17, 0.05, 24)), materials.mangoPickle);
    pickleFill.position.y = 0.09;
    pickleGroup.add(pickleFill);
    registerPart(root, pickleGroup, 'Spiced Mango Achar Pickle', 0.34, explodableParts);

    // 6. Instanced Roasted Cumin & Herbs over Curd
    const cuminGeo = trackGeo(new THREE.SphereGeometry(0.012, 8, 6));
    const cuminInst = new THREE.InstancedMesh(cuminGeo, materials.crispyOnion, 22);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 22; i++) {
      const a = i * 2.4;
      const r = 0.03 + (i % 5) * 0.04;
      dummy.position.set(-1.12 + Math.cos(a) * r, 0.2, -0.58 + Math.sin(a) * r);
      dummy.scale.set(1.8, 0.55, 0.55);
      dummy.rotation.y = a;
      dummy.updateMatrix();
      cuminInst.setMatrixAt(i, dummy.matrix);
    }
    cuminInst.instanceMatrix.needsUpdate = true;
    cuminInst.computeBoundingSphere();
    registerPart(root, cuminInst, 'Toasted Cumin & Coriander Dusting', 0.5, explodableParts);
  } else if (key === 'salad') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.24, 0.54, 0.06, 0.58)), materials.vesselPrimary);
    registerPart(root, bowl, 'Deep Stoneware Salad Bowl', 0, explodableParts);

    const lettuceGroup = new THREE.Group();
    lettuceGroup.position.y = 0.16;
    const leafGeo = trackGeo(createLeafGeometry(2.6));
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.lettuceLeaf);
      leaf.position.set(Math.cos(a) * 0.28, 0.04 + (i % 3) * 0.03, Math.sin(a) * 0.28);
      leaf.rotation.set(-0.35, a + Math.PI / 2, 0.2);
      lettuceGroup.add(leaf);
    }
    registerPart(root, lettuceGroup, 'Crisp Butter Lettuce Leaves', 0.28, explodableParts);

    const cucGroup = new THREE.Group();
    cucGroup.position.y = 0.34;
    const cucGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 24));
    [
      [-0.36, 0.02, 0.2, 0.25],
      [0.32, 0.04, -0.18, -0.3],
      [-0.1, 0.06, -0.38, 0.18],
      [0.2, 0.03, 0.34, -0.2],
    ].forEach(([x, y, z, tilt]) => {
      const slice = new THREE.Mesh(cucGeo, materials.cucumberSlice);
      slice.position.set(x, y, z);
      slice.rotation.set(tilt, tilt * 2, tilt * 0.5);
      cucGroup.add(slice);
    });
    registerPart(root, cucGroup, 'Sliced English Cucumber', 0.56, explodableParts);

    const tomatoGroup = new THREE.Group();
    tomatoGroup.position.y = 0.42;
    const tomGeo = trackGeo(new THREE.SphereGeometry(0.11, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55));
    [
      [-0.18, 0.02, 0.35],
      [0.35, 0.04, 0.14],
      [-0.38, 0.03, -0.16],
      [0.05, 0.06, -0.1],
      [0.14, 0.03, -0.4],
    ].forEach(([x, y, z], idx) => {
      const tom = new THREE.Mesh(tomGeo, materials.cherryTomato);
      tom.position.set(x, y, z);
      tom.rotation.set(0.3 * (idx % 2), idx, 0.2);
      tomatoGroup.add(tom);
    });
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.16, 0.018, 10, 28));
    ringGeo.rotateX(Math.PI / 2);
    [
      [-0.08, 0.08, 0.08],
      [0.24, 0.09, -0.2],
      [-0.26, 0.07, -0.25],
    ].forEach(([x, y, z], idx) => {
      const ring = new THREE.Mesh(ringGeo, materials.redOnion);
      ring.position.set(x, y, z);
      ring.rotation.set(0.25, idx * 0.8, 0.15);
      tomatoGroup.add(ring);
    });
    registerPart(root, tomatoGroup, 'Cherry Tomatoes & Red Onion Rings', 0.84, explodableParts);

    const lemonGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24, 1, false, 0, Math.PI * 0.85));
    lemonGeo.rotateZ(Math.PI / 2);
    const lemon = new THREE.Mesh(lemonGeo, materials.lemonFlesh);
    lemon.position.set(0.56, 0.46, 0.26);
    lemon.rotation.set(0.2, 0.7, 0.3);
    registerPart(root, lemon, 'Fresh Pressed Lemon Wedge', 1.12, explodableParts);

    const fleckGeo = trackGeo(new THREE.DodecahedronGeometry(0.015, 0));
    const fleckInst = new THREE.InstancedMesh(fleckGeo, materials.pepperGrain, 28);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 28; i++) {
      const a = i * 2.39996;
      const r = 0.08 + Math.sqrt(i / 28) * 0.56;
      dummy.position.set(Math.cos(a) * r, 0.49 + (i % 3) * 0.02, Math.sin(a) * r);
      dummy.updateMatrix();
      fleckInst.setMatrixAt(i, dummy.matrix);
    }
    fleckInst.instanceMatrix.needsUpdate = true;
    fleckInst.computeBoundingSphere();
    registerPart(root, fleckInst, 'Cracked Pepper & Sea Salt Dressing', 1.32, explodableParts);

    const server = createSpoonGroup(materials.carvedWood, trackGeo);
    server.position.set(1.28, 0.02, 0.28);
    server.rotation.y = -0.28;
    registerPart(root, server, 'Carved Oak Salad Server', 0.16, explodableParts);
  } else if (key === 'pancakes') {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.28, 0.11)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Ceramic Breakfast Plate', 0, explodableParts);

    const panGeo = trackGeo(new THREE.CylinderGeometry(0.76, 0.78, 0.13, 40));
    [0.06, 0.21, 0.36].forEach((y, idx) => {
      const pancake = new THREE.Mesh(panGeo, materials.pancakeCrumb);
      pancake.position.set(idx === 1 ? 0.02 : 0, y + 0.06, idx === 2 ? -0.02 : 0);
      pancake.scale.set(1 - idx * 0.03, 1, 1 - idx * 0.03);
      registerPart(root, pancake, `Golden Griddle Pancake #${idx + 1}`, 0.18 + idx * 0.22, explodableParts);
    });

    const butter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.075, 0.24)), materials.butterPat);
    butter.position.set(0, 0.52, 0);
    butter.rotation.y = 0.38;
    registerPart(root, butter, 'Cultured Melting Butter Pat', 0.85, explodableParts);

    const syrupGroup = new THREE.Group();
    syrupGroup.position.y = 0.49;
    syrupGroup.add(new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.46, 0.46, 0.018, 32)), materials.mapleSyrup));
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42),
        new THREE.Vector3(Math.cos(a) * 0.75, -0.04, Math.sin(a) * 0.75),
        new THREE.Vector3(Math.cos(a) * 0.79, -0.25, Math.sin(a) * 0.79),
        new THREE.Vector3(Math.cos(a) * 0.82, -0.41, Math.sin(a) * 0.82),
      ]);
      syrupGroup.add(new THREE.Mesh(trackGeo(new THREE.TubeGeometry(curve, 24, 0.028, 10, false)), materials.mapleSyrup));
    }
    registerPart(root, syrupGroup, 'Amber Maple Syrup Drizzle', 1.05, explodableParts);

    const berryGeo = trackGeo(new THREE.SphereGeometry(0.055, 16, 12));
    const berryInst = new THREE.InstancedMesh(berryGeo, materials.blueberry, 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      if (i < 10) {
        const a = (i / 10) * Math.PI * 2;
        const r = 0.28 + (i % 2) * 0.14;
        dummy.position.set(Math.cos(a) * r, 0.53, Math.sin(a) * r);
      } else {
        const a = ((i - 10) / 14) * Math.PI * 2;
        const r = 0.88 + (i % 2) * 0.09;
        dummy.position.set(Math.cos(a) * r, 0.09, Math.sin(a) * r);
      }
      dummy.scale.set(1, 0.88, 1);
      dummy.updateMatrix();
      berryInst.setMatrixAt(i, dummy.matrix);
    }
    berryInst.instanceMatrix.needsUpdate = true;
    berryInst.computeBoundingSphere();
    registerPart(root, berryInst, 'Fresh Wild Blueberries', 1.25, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.25, 0.02, 0.34);
    fork.rotation.y = -0.25;
    registerPart(root, fork, 'Vintage Silver Breakfast Fork', 0.14, explodableParts);
  } else if (key === 'pizza') {
    const peelShape = new THREE.Shape();
    peelShape.absarc(0, 0, 1.32, 0, Math.PI * 2, false);
    const peelGeo = trackGeo(
      new THREE.ExtrudeGeometry(peelShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2,
      }),
    );
    peelGeo.rotateX(-Math.PI / 2);
    const peelGroup = new THREE.Group();
    peelGroup.add(new THREE.Mesh(peelGeo, materials.carvedWood));
    const handle = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.055, 0.72)), materials.carvedWood);
    handle.position.set(0, 0.028, 1.56);
    peelGroup.add(handle);
    registerPart(root, peelGroup, 'Rustic Oak Pizza Peel', 0, explodableParts);

    const base = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.06, 1.06, 0.05, 48)), materials.pizzaCenter);
    base.position.y = 0.085;
    registerPart(root, base, 'Crushed Tomato & Mozzarella Base', 0.25, explodableParts);

    const crustGeo = trackGeo(new THREE.TorusGeometry(1.06, 0.11, 20, 56));
    crustGeo.rotateX(Math.PI / 2);
    const crust = new THREE.Mesh(crustGeo, materials.pizzaCrust);
    crust.position.y = 0.12;
    crust.scale.set(1, 1, 0.85);
    registerPart(root, crust, 'Charred Artisan Crust Rim', 0.45, explodableParts);

    const mozzGroup = new THREE.Group();
    mozzGroup.position.y = 0.125;
    const mozzGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.18, 0.026, 20));
    [
      [0, 0, 0],
      [-0.48, 0, 0.26],
      [0.46, 0, 0.28],
      [-0.42, 0, -0.38],
      [0.44, 0, -0.34],
      [0.02, 0, 0.56],
    ].forEach(([x, y, z], idx) => {
      const m = new THREE.Mesh(mozzGeo, materials.mozzarella);
      m.position.set(x, y, z);
      m.scale.set(1 + (idx % 2) * 0.15, 1, 0.85);
      m.rotation.y = idx * 0.9;
      mozzGroup.add(m);
    });
    registerPart(root, mozzGroup, 'Melted Fior di Latte Mozzarella', 0.72, explodableParts);

    const basilGroup = new THREE.Group();
    basilGroup.position.y = 0.155;
    const leafGeo = trackGeo(createLeafGeometry(1.3));
    [
      [0.05, 0.01, -0.05, 0.3],
      [-0.44, 0.01, 0.28, 1.4],
      [0.48, 0.01, 0.22, -0.9],
      [-0.36, 0.01, -0.34, 2.5],
      [0.38, 0.01, -0.38, -2.1],
      [-0.08, 0.01, 0.52, 0.8],
    ].forEach(([x, y, z, rot]) => {
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(x, y, z);
      leaf.rotation.set(0.15, rot, 0.08);
      basilGroup.add(leaf);
    });
    registerPart(root, basilGroup, 'Sweet Garden Basil Leaves', 0.96, explodableParts);

    const flakeGeo = trackGeo(new THREE.DodecahedronGeometry(0.014, 0));
    const flakeInst = new THREE.InstancedMesh(flakeGeo, materials.pepperGrain, 30);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const a = i * 2.39996;
      const r = 0.1 + Math.sqrt(i / 30) * 0.84;
      dummy.position.set(Math.cos(a) * r, 0.14, Math.sin(a) * r);
      dummy.updateMatrix();
      flakeInst.setMatrixAt(i, dummy.matrix);
    }
    flakeInst.instanceMatrix.needsUpdate = true;
    flakeInst.computeBoundingSphere();
    registerPart(root, flakeInst, 'Cracked Pepper & Sea Salt Flakes', 1.15, explodableParts);

    const cutterGroup = new THREE.Group();
    cutterGroup.position.set(1.26, 0.08, -0.2);
    cutterGroup.rotation.y = 0.45;
    const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.014, 32));
    wheelGeo.rotateZ(Math.PI / 2);
    cutterGroup.add(new THREE.Mesh(wheelGeo, materials.stainlessSteel));
    const cHandleGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.036, 0.5, 16));
    cHandleGeo.rotateX(Math.PI / 2);
    const cHandle = new THREE.Mesh(cHandleGeo, materials.carvedWood);
    cHandle.position.set(0, 0.04, 0.32);
    cutterGroup.add(cHandle);
    registerPart(root, cutterGroup, 'Stainless Steel Pizza Cutter', 0.15, explodableParts);
  } else if (key === 'curry') {
    const kadaiGroup = new THREE.Group();
    kadaiGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.95, 0.56, 0.045, 0.48)), materials.brushedBrass));
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.46, -0.18),
      new THREE.Vector3(0.22, 0.58, 0),
      new THREE.Vector3(0, 0.46, 0.18),
    ]);
    const handleGeo = trackGeo(new THREE.TubeGeometry(handleCurve, 20, 0.025, 10, false));
    const leftHandle = new THREE.Mesh(handleGeo, materials.brushedBrass);
    leftHandle.position.x = -0.92;
    leftHandle.rotation.y = Math.PI;
    const rightHandle = new THREE.Mesh(handleGeo, materials.brushedBrass);
    rightHandle.position.x = 0.92;
    kadaiGroup.add(leftHandle, rightHandle);
    registerPart(root, kadaiGroup, 'Hammered Brass Kadai Serving Pot', 0, explodableParts);

    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.76, 0.6, 0.12, 40)), materials.curryGravy);
    gravy.position.y = 0.34;
    registerPart(root, gravy, 'Simmered Spiced Tomato Masala Gravy', 0.32, explodableParts);

    const peaGeo = trackGeo(new THREE.SphereGeometry(0.052, 14, 10));
    const peaInst = new THREE.InstancedMesh(peaGeo, materials.chickpea, 36);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 36; i++) {
      const a = i * 2.39996;
      const r = 0.08 + Math.sqrt(i / 36) * 0.62;
      dummy.position.set(Math.cos(a) * r, 0.4 + (i % 3) * 0.018, Math.sin(a) * r);
      dummy.scale.set(1.1, 0.85, 0.95);
      dummy.rotation.set(i * 0.5, i, 0);
      dummy.updateMatrix();
      peaInst.setMatrixAt(i, dummy.matrix);
    }
    peaInst.instanceMatrix.needsUpdate = true;
    peaInst.computeBoundingSphere();
    registerPart(root, peaInst, 'Tender Spiced Chickpeas', 0.62, explodableParts);

    const cilantroGroup = new THREE.Group();
    cilantroGroup.position.y = 0.46;
    const leafGeo = trackGeo(createLeafGeometry(0.9));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22);
      leaf.rotation.set(0.25, a, 0.1);
      cilantroGroup.add(leaf);
    }
    registerPart(root, cilantroGroup, 'Fresh Cilantro Garnish', 0.92, explodableParts);

    const riceGroup = new THREE.Group();
    riceGroup.position.set(-1.12, 0.01, -0.64);
    riceGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.42, 0.25, 0.03, 0.22)), materials.vesselPrimary));
    const riceDomeGeo = trackGeo(new THREE.SphereGeometry(0.35, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52));
    riceDomeGeo.scale(1, 0.55, 1);
    const riceDome = new THREE.Mesh(riceDomeGeo, materials.basmatiRice);
    riceDome.position.y = 0.14;
    riceGroup.add(riceDome);
    registerPart(root, riceGroup, 'Steamed Basmati Rice Bowl', 0.22, explodableParts);

    const naan = new THREE.Mesh(createNaanGeometry(trackGeo), materials.naanBread);
    naan.position.set(1.12, 0.02, 0.48);
    naan.rotation.y = -0.45;
    registerPart(root, naan, 'Warm Blistered Garlic Naan', 0.28, explodableParts);
  } else if (key === 'poha') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.12, 0.46, 0.055, 0.54)), materials.vesselPrimary);
    registerPart(root, bowl, 'Warm Stoneware Breakfast Bowl', 0, explodableParts);

    const moundGeo = trackGeo(new THREE.SphereGeometry(0.84, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46));
    moundGeo.scale(1, 0.42, 1);
    const mound = new THREE.Mesh(moundGeo, materials.pohaFlake);
    mound.position.y = 0.2;
    registerPart(root, mound, 'Turmeric Flattened Rice (Poha)', 0.34, explodableParts);

    const peanutGeo = trackGeo(new THREE.SphereGeometry(0.045, 12, 10));
    peanutGeo.scale(1.35, 0.85, 0.9);
    const peanutInst = new THREE.InstancedMesh(peanutGeo, materials.chickpea, 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      const a = i * 2.39996;
      const r = 0.05 + Math.sqrt(i / 24) * 0.48;
      dummy.position.set(Math.cos(a) * r, 0.56 - r * 0.2, Math.sin(a) * r);
      dummy.rotation.set(i * 0.4, a, 0.2);
      dummy.updateMatrix();
      peanutInst.setMatrixAt(i, dummy.matrix);
    }
    peanutInst.instanceMatrix.needsUpdate = true;
    peanutInst.computeBoundingSphere();
    registerPart(root, peanutInst, 'Crunchy Roasted Peanuts & Sev', 0.68, explodableParts);

    const rubyGeo = trackGeo(new THREE.SphereGeometry(0.024, 10, 8));
    const rubyInst = new THREE.InstancedMesh(rubyGeo, materials.cherryTomato, 22);
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39996 + 0.8;
      const r = 0.06 + Math.sqrt(i / 22) * 0.42;
      dummy.position.set(Math.cos(a) * r, 0.59 - r * 0.18, Math.sin(a) * r);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      rubyInst.setMatrixAt(i, dummy.matrix);
    }
    rubyInst.instanceMatrix.needsUpdate = true;
    rubyInst.computeBoundingSphere();
    registerPart(root, rubyInst, 'Fresh Pomegranate Arils', 0.95, explodableParts);

    const garnishGroup = new THREE.Group();
    garnishGroup.position.y = 0.56;
    const leafGeo = trackGeo(createLeafGeometry(0.85));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.18, 0.03, Math.sin(a) * 0.18);
      leaf.rotation.set(0.25, a, 0.1);
      garnishGroup.add(leaf);
    }
    const lemon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20, 1, false, 0, Math.PI * 0.85)),
      materials.lemonFlesh,
    );
    lemon.rotation.set(0.2, 0.6, Math.PI / 2);
    lemon.position.set(0.55, -0.05, 0.25);
    garnishGroup.add(lemon);
    registerPart(root, garnishGroup, 'Cilantro & Fresh Lemon Wedge', 1.18, explodableParts);

    const spoon = createSpoonGroup(materials.stainlessSteel, trackGeo);
    spoon.position.set(1.22, 0.02, 0.34);
    spoon.rotation.y = -0.3;
    registerPart(root, spoon, 'Vintage Steel Spoon', 0.16, explodableParts);
  } else if (key === 'avocado_toast') {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.32, 0.11)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Ceramic Breakfast Plate', 0, explodableParts);

    const toastGroup = new THREE.Group();
    toastGroup.position.y = 0.09;
    const sliceGeo = trackGeo(new THREE.BoxGeometry(0.74, 0.11, 0.98));
    const s1 = new THREE.Mesh(sliceGeo, materials.parathaBread);
    s1.position.set(-0.42, 0.04, 0.08);
    s1.rotation.y = 0.12;
    const s2 = new THREE.Mesh(sliceGeo, materials.parathaBread);
    s2.position.set(0.42, 0.04, -0.06);
    s2.rotation.y = -0.14;
    toastGroup.add(s1, s2);
    registerPart(root, toastGroup, 'Toasted Artisan Sourdough Slices', 0.24, explodableParts);

    const avoGroup = new THREE.Group();
    avoGroup.position.y = 0.17;
    const avoGeo = trackGeo(new THREE.BoxGeometry(0.62, 0.07, 0.84));
    const a1 = new THREE.Mesh(avoGeo, materials.avocadoMash);
    a1.position.set(-0.42, 0.02, 0.08);
    a1.rotation.y = 0.12;
    const a2 = new THREE.Mesh(avoGeo, materials.avocadoMash);
    a2.position.set(0.42, 0.02, -0.06);
    a2.rotation.y = -0.14;
    avoGroup.add(a1, a2);
    registerPart(root, avoGroup, 'Lemon-Herb Smashed Avocado', 0.52, explodableParts);

    const eggGroup = new THREE.Group();
    eggGroup.position.y = 0.24;
    const whiteGeo = trackGeo(new THREE.SphereGeometry(0.22, 24, 16));
    whiteGeo.scale(1.1, 0.5, 0.95);
    const yolkGeo = trackGeo(new THREE.SphereGeometry(0.1, 20, 14));
    yolkGeo.scale(1, 0.72, 1);
    [
      [-0.42, 0.05, 0.08],
      [0.42, 0.05, -0.06],
    ].forEach(([x, y, z]) => {
      const w = new THREE.Mesh(whiteGeo, materials.poachedEggWhite);
      w.position.set(x, y, z);
      const yk = new THREE.Mesh(yolkGeo, materials.eggYolk);
      yk.position.set(x, y + 0.055, z);
      eggGroup.add(w, yk);
    });
    registerPart(root, eggGroup, 'Soft Poached Free-Range Eggs', 0.84, explodableParts);

    const microGroup = new THREE.Group();
    microGroup.position.y = 0.35;
    const leafGeo = trackGeo(createLeafGeometry(0.75));
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -0.42 : 0.42;
      const leaf = new THREE.Mesh(leafGeo, materials.lettuceLeaf);
      leaf.position.set(side + ((i % 2) - 0.5) * 0.18, 0.03, ((i % 3) - 1) * 0.14);
      leaf.rotation.set(0.3, i * 0.8, 0.15);
      microGroup.add(leaf);
    }
    registerPart(root, microGroup, 'Microgreens & Chili Flakes', 1.12, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.26, 0.02, 0.3);
    fork.rotation.y = -0.25;
    registerPart(root, fork, 'Brushed Steel Fork', 0.14, explodableParts);
  } else if (key === 'rajma_chawal') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.92, 0.52, 0.048, 0.46)), materials.vesselPrimary);
    bowl.position.set(-0.28, 0, 0.14);
    registerPart(root, bowl, 'Artisanal Ceramic Curry Bowl', 0, explodableParts);

    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.74, 0.58, 0.12, 36)), materials.rajmaGravy);
    gravy.position.set(-0.28, 0.32, 0.14);
    registerPart(root, gravy, 'Slow-Simmered Tomato Rajma Gravy', 0.32, explodableParts);

    const beanGeo = trackGeo(new THREE.SphereGeometry(0.046, 12, 10));
    beanGeo.scale(1.5, 0.85, 0.9);
    const beanInst = new THREE.InstancedMesh(beanGeo, materials.rajmaGravy, 34);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 34; i++) {
      const a = i * 2.39996;
      const r = 0.05 + Math.sqrt(i / 34) * 0.6;
      dummy.position.set(-0.28 + Math.cos(a) * r, 0.39 + (i % 3) * 0.015, 0.14 + Math.sin(a) * r);
      dummy.rotation.set(0.2, a, 0.1);
      dummy.updateMatrix();
      beanInst.setMatrixAt(i, dummy.matrix);
    }
    beanInst.instanceMatrix.needsUpdate = true;
    beanInst.computeBoundingSphere();
    registerPart(root, beanInst, 'Tender Punjabi Red Kidney Beans', 0.64, explodableParts);

    const garnishGroup = new THREE.Group();
    garnishGroup.position.set(-0.28, 0.45, 0.14);
    const leafGeo = trackGeo(createLeafGeometry(0.9));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2);
      leaf.rotation.set(0.2, a, 0.1);
      garnishGroup.add(leaf);
    }
    registerPart(root, garnishGroup, 'Fresh Cilantro & Ginger Juliennes', 0.94, explodableParts);

    const riceGroup = new THREE.Group();
    riceGroup.position.set(0.92, 0.01, -0.45);
    riceGroup.add(new THREE.Mesh(trackGeo(createLathePlateGeometry(0.64, 0.08)), materials.vesselPrimary));
    const riceDomeGeo = trackGeo(new THREE.SphereGeometry(0.5, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.46));
    riceDomeGeo.scale(1, 0.48, 1);
    const riceDome = new THREE.Mesh(riceDomeGeo, materials.basmatiRice);
    riceDome.position.y = 0.06;
    riceGroup.add(riceDome);
    registerPart(root, riceGroup, 'Steamed Jeera Basmati Rice', 0.26, explodableParts);

    const onionGroup = new THREE.Group();
    onionGroup.position.set(0.92, 0.02, 0.56);
    onionGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.28, 0.16, 0.024, 0.15)), materials.vesselAccent));
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.1, 0.015, 8, 20));
    ringGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(ringGeo, materials.redOnion);
      r.position.set((i - 1.5) * 0.03, 0.12 + i * 0.01, 0);
      onionGroup.add(r);
    }
    registerPart(root, onionGroup, 'Pickled Red Onion Rings', 0.42, explodableParts);
  } else if (key === 'falafel_bowl') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.24, 0.5, 0.055, 0.58)), materials.vesselPrimary);
    registerPart(root, bowl, 'Wide Speckled Stoneware Bowl', 0, explodableParts);

    const hummus = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.54, 0.46, 0.1, 32)),
      materials.hummusCream,
    );
    hummus.position.set(0.36, 0.2, 0.1);
    registerPart(root, hummus, 'Silky Tahini Hummus Swirl', 0.28, explodableParts);

    const falafelGroup = new THREE.Group();
    falafelGroup.position.set(-0.08, 0.34, -0.05);
    const ballGeo = trackGeo(new THREE.SphereGeometry(0.16, 18, 14));
    [
      [-0.2, 0.04, 0.18],
      [0.1, 0.05, 0.22],
      [-0.12, 0.06, -0.14],
      [0.16, 0.04, -0.12],
      [-0.02, 0.18, 0.04],
    ].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(ballGeo, materials.herbLeaf);
      b.position.set(x, y, z);
      b.scale.set(1, 0.82, 1);
      falafelGroup.add(b);
    });
    registerPart(root, falafelGroup, 'Crispy Herb Chickpea Falafel', 0.62, explodableParts);

    const saladGroup = new THREE.Group();
    saladGroup.position.set(-0.46, 0.24, 0.38);
    const tomGeo = trackGeo(new THREE.SphereGeometry(0.08, 14, 10));
    const cucGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 18));
    for (let i = 0; i < 4; i++) {
      const tom = new THREE.Mesh(tomGeo, materials.cherryTomato);
      tom.position.set((i - 1.5) * 0.14, 0.04, (i % 2) * 0.12);
      saladGroup.add(tom);
      const cuc = new THREE.Mesh(cucGeo, materials.cucumberSlice);
      cuc.position.set((i - 1.5) * 0.12, 0.03, -0.12);
      cuc.rotation.x = 0.3;
      saladGroup.add(cuc);
    }
    registerPart(root, saladGroup, 'Cucumber-Tomato & Pickled Turnip Salad', 0.88, explodableParts);

    const pitaGroup = new THREE.Group();
    pitaGroup.position.set(-0.56, 0.26, -0.36);
    const pitaGeo = trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.035, 3));
    for (let i = 0; i < 3; i++) {
      const tri = new THREE.Mesh(pitaGeo, materials.naanBread);
      tri.position.set(i * 0.08, i * 0.04, i * 0.05);
      tri.rotation.set(0.35, 0.4 + i * 0.25, 0.15);
      pitaGroup.add(tri);
    }
    registerPart(root, pitaGroup, 'Warm Grilled Pita Wedges', 0.45, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.26, 0.02, 0.32);
    fork.rotation.y = -0.26;
    registerPart(root, fork, 'Brushed Steel Fork', 0.14, explodableParts);
  } else if (key === 'dal_makhani') {
    const kadaiGroup = new THREE.Group();
    kadaiGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.95, 0.54, 0.045, 0.48)), materials.brushedBrass));
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.44, -0.18),
      new THREE.Vector3(0.22, 0.56, 0),
      new THREE.Vector3(0, 0.44, 0.18),
    ]);
    const handleGeo = trackGeo(new THREE.TubeGeometry(handleCurve, 20, 0.025, 10, false));
    const lh = new THREE.Mesh(handleGeo, materials.brushedBrass);
    lh.position.x = -0.92;
    lh.rotation.y = Math.PI;
    const rh = new THREE.Mesh(handleGeo, materials.brushedBrass);
    rh.position.x = 0.92;
    kadaiGroup.add(lh, rh);
    registerPart(root, kadaiGroup, 'Hammered Copper-Brass Kadai', 0, explodableParts);

    const gravy = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.76, 0.6, 0.12, 40)), materials.dalMakhaniGravy);
    gravy.position.y = 0.34;
    registerPart(root, gravy, 'Slow-Simmered Black Urad Dal', 0.3, explodableParts);

    const swirl = new THREE.Mesh(createCreamSwirlGeometry(0.45, 1.8, trackGeo), materials.whiteButter);
    swirl.position.y = 0.41;
    registerPart(root, swirl, 'Rich Fresh Cream Swirl', 0.62, explodableParts);

    const butter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.075, 0.22)), materials.butterPat);
    butter.position.set(0, 0.44, 0);
    butter.rotation.y = 0.4;
    registerPart(root, butter, 'Melting Cultured Makkhan Butter', 0.9, explodableParts);

    const riceGroup = new THREE.Group();
    riceGroup.position.set(1.16, 0.01, 0.44);
    riceGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.4, 0.24, 0.03, 0.22)), materials.vesselAccent));
    const riceDomeGeo = trackGeo(new THREE.SphereGeometry(0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5));
    riceDomeGeo.scale(1, 0.5, 1);
    const riceDome = new THREE.Mesh(riceDomeGeo, materials.basmatiRice);
    riceDome.position.y = 0.14;
    riceGroup.add(riceDome);
    registerPart(root, riceGroup, 'Steamed Cumin Jeera Rice', 0.22, explodableParts);

    const naan = new THREE.Mesh(createNaanGeometry(trackGeo), materials.naanBread);
    naan.position.set(-1.14, 0.02, -0.35);
    naan.rotation.y = 0.45;
    registerPart(root, naan, 'Blistered Garlic Butter Naan', 0.26, explodableParts);
  } else if (key === 'risotto') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.18, 0.44, 0.055, 0.56)), materials.vesselPrimary);
    registerPart(root, bowl, 'Handmade Ceramic Risotto Bowl', 0, explodableParts);

    const rice = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.88, 0.7, 0.12, 40)), materials.risottoGrain);
    rice.position.y = 0.22;
    registerPart(root, rice, 'Creamy Arborio Rice Base', 0.28, explodableParts);

    const mushGroup = new THREE.Group();
    mushGroup.position.y = 0.32;
    const capGeo = trackGeo(new THREE.SphereGeometry(0.14, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55));
    capGeo.scale(1.1, 0.65, 0.85);
    [
      [-0.18, 0.03, 0.14, 0.3],
      [0.2, 0.04, -0.08, -0.4],
      [0.02, 0.06, -0.18, 0.9],
      [-0.08, 0.04, 0.22, -0.7],
      [0.22, 0.02, 0.2, 0.5],
    ].forEach(([x, y, z, rot]) => {
      const m = new THREE.Mesh(capGeo, materials.creminiMushroom);
      m.position.set(x, y, z);
      m.rotation.set(0.25, rot, 0.1);
      mushGroup.add(m);
    });
    registerPart(root, mushGroup, 'Seared Cremini Mushrooms', 0.62, explodableParts);

    const parmGroup = new THREE.Group();
    parmGroup.position.y = 0.4;
    const parmGeo = trackGeo(new THREE.TorusGeometry(0.12, 0.018, 8, 20, Math.PI * 1.4));
    for (let i = 0; i < 4; i++) {
      const curl = new THREE.Mesh(parmGeo, materials.parmesanFlake);
      curl.position.set((i - 1.5) * 0.14, 0.03 + (i % 2) * 0.03, (i % 2) * 0.12);
      curl.rotation.set(0.4, i * 1.1, 0.3);
      parmGroup.add(curl);
    }
    registerPart(root, parmGroup, 'Shaved Parmigiano-Reggiano Curls', 0.92, explodableParts);

    const herbGroup = new THREE.Group();
    herbGroup.position.y = 0.44;
    const leafGeo = trackGeo(createLeafGeometry(0.8));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2);
      leaf.rotation.set(0.2, a, 0.1);
      herbGroup.add(leaf);
    }
    registerPart(root, herbGroup, 'Fresh Thyme & Cracked Pepper', 1.16, explodableParts);

    const spoon = createSpoonGroup(materials.stainlessSteel, trackGeo);
    spoon.position.set(1.24, 0.02, 0.32);
    spoon.rotation.y = -0.25;
    registerPart(root, spoon, 'Brushed Steel Tasting Spoon', 0.14, explodableParts);
  } else if (key === 'samosa_chaat') {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.32, 0.12)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Stoneware Chaat Platter', 0, explodableParts);

    const choleBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.84, 0.72, 0.07, 36)), materials.choleGravy);
    choleBase.position.y = 0.09;
    registerPart(root, choleBase, 'Spiced Chickpea Chole Bed', 0.2, explodableParts);

    const samGroup = new THREE.Group();
    samGroup.position.y = 0.2;
    const samGeo = trackGeo(new THREE.ConeGeometry(0.28, 0.36, 4));
    [
      [-0.3, 0.04, 0.18, 0.2],
      [0.28, 0.05, 0.16, -0.4],
      [0.0, 0.08, -0.22, 0.9],
    ].forEach(([x, y, z, rot]) => {
      const s = new THREE.Mesh(samGeo, materials.bhaturaBread);
      s.position.set(x, y, z);
      s.rotation.set(0.45, rot, 0.25);
      samGroup.add(s);
    });
    registerPart(root, samGroup, 'Crushed Golden Potato Samosas', 0.48, explodableParts);

    const chutneyGroup = new THREE.Group();
    chutneyGroup.position.y = 0.34;
    const yogurtSwirl = new THREE.Mesh(createCreamSwirlGeometry(0.5, 1.4, trackGeo), materials.whiteButter);
    const tamSwirl = new THREE.Mesh(createCreamSwirlGeometry(0.42, 1.2, trackGeo), materials.tamarindGlaze);
    tamSwirl.rotation.y = 1.1;
    const mintSwirl = new THREE.Mesh(createCreamSwirlGeometry(0.36, 1.1, trackGeo), materials.lettuceLeaf);
    mintSwirl.rotation.y = 2.2;
    chutneyGroup.add(yogurtSwirl, tamSwirl, mintSwirl);
    registerPart(root, chutneyGroup, 'Yogurt, Tamarind & Mint Chutneys', 0.8, explodableParts);

    const sevGeo = trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6));
    const sevInst = new THREE.InstancedMesh(sevGeo, materials.pohaFlake, 40);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const a = i * 2.39996;
      const r = 0.06 + Math.sqrt(i / 40) * 0.56;
      dummy.position.set(Math.cos(a) * r, 0.39 + (i % 3) * 0.015, Math.sin(a) * r);
      dummy.rotation.set(Math.PI / 2 + (i % 3) * 0.2, a, 0.3);
      dummy.updateMatrix();
      sevInst.setMatrixAt(i, dummy.matrix);
    }
    sevInst.instanceMatrix.needsUpdate = true;
    sevInst.computeBoundingSphere();
    registerPart(root, sevInst, 'Crispy Nylon Sev & Pomegranate', 1.12, explodableParts);

    const fork = createForkGroup(materials.brushedBrass, trackGeo);
    fork.position.set(-1.24, 0.02, 0.34);
    fork.rotation.y = 0.28;
    registerPart(root, fork, 'Handcrafted Brass Chaat Fork', 0.14, explodableParts);
  } else if (key === 'gulab_jamun') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.06, 0.44, 0.04, 0.54)), materials.brushedBrass);
    registerPart(root, bowl, 'Hammered Brass Dessert Bowl', 0, explodableParts);

    const syrup = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.84, 0.68, 0.1, 40)), materials.gulabSyrup);
    syrup.position.y = 0.22;
    registerPart(root, syrup, 'Saffron & Rosewater Cardamom Syrup', 0.26, explodableParts);

    const jamunGroup = new THREE.Group();
    jamunGroup.position.y = 0.31;
    const ballGeo = trackGeo(new THREE.SphereGeometry(0.19, 24, 18));
    [
      [0, 0.05, 0],
      [-0.42, 0.01, 0.18],
      [0.42, 0.01, 0.18],
      [-0.26, 0.01, -0.36],
      [0.26, 0.01, -0.36],
      [0, 0.01, 0.44],
    ].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(ballGeo, materials.gulabBall);
      b.position.set(x, y, z);
      jamunGroup.add(b);
    });
    registerPart(root, jamunGroup, 'Golden Khoya Gulab Jamuns', 0.62, explodableParts);

    const pistGeo = trackGeo(new THREE.BoxGeometry(0.036, 0.014, 0.024));
    const pistInst = new THREE.InstancedMesh(pistGeo, materials.pistachioCrumb, 30);
    const dummy = new THREE.Object3D();
    const centers = [
      [0, 0.52, 0],
      [-0.42, 0.48, 0.18],
      [0.42, 0.48, 0.18],
      [-0.26, 0.48, -0.36],
      [0.26, 0.48, -0.36],
      [0, 0.48, 0.44],
    ];
    for (let i = 0; i < 30; i++) {
      const c = centers[i % centers.length];
      const a = i * 2.4;
      const r = (i % 4) * 0.025;
      dummy.position.set(c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r);
      dummy.rotation.set(0.2, a, 0.1);
      dummy.updateMatrix();
      pistInst.setMatrixAt(i, dummy.matrix);
    }
    pistInst.instanceMatrix.needsUpdate = true;
    pistInst.computeBoundingSphere();
    registerPart(root, pistInst, 'Crushed Green Pistachios & Saffron', 0.96, explodableParts);

    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(1.18, 0.02, 0.34);
    spoon.rotation.y = -0.32;
    registerPart(root, spoon, 'Handcrafted Brass Dessert Spoon', 0.15, explodableParts);
  } else if (key === 'pav_bhaji') {
    const platter = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.38, 0.12)), materials.vesselAccent);
    registerPart(root, platter, 'Charcoal Stoneware Street Platter', 0, explodableParts);

    const bhajiGroup = new THREE.Group();
    bhajiGroup.position.set(0.32, 0.06, 0.08);
    bhajiGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.56, 0.28, 0.035, 0.32)), materials.vesselPrimary));
    const bhajiFill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.49, 0.4, 0.08, 32)), materials.makhaniGravy);
    bhajiFill.position.y = 0.2;
    bhajiGroup.add(bhajiFill);
    registerPart(root, bhajiGroup, 'Spiced Butter Vegetable Bhaji', 0.3, explodableParts);

    const butter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.075, 0.22)), materials.butterPat);
    butter.position.set(0.32, 0.32, 0.08);
    butter.rotation.y = 0.4;
    registerPart(root, butter, 'Melting Salted Butter Pat', 0.65, explodableParts);

    const pavGroup = new THREE.Group();
    pavGroup.position.set(-0.56, 0.14, 0.1);
    const pavGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.24, 0.46));
    const p1 = new THREE.Mesh(pavGeo, materials.bhaturaBread);
    p1.position.set(-0.08, 0.06, -0.24);
    p1.rotation.y = 0.18;
    const p2 = new THREE.Mesh(pavGeo, materials.bhaturaBread);
    p2.position.set(0.06, 0.06, 0.28);
    p2.rotation.y = -0.14;
    pavGroup.add(p1, p2);
    registerPart(root, pavGroup, 'Butter-Toasted Ladi Pav Buns', 0.48, explodableParts);

    const sideGroup = new THREE.Group();
    sideGroup.position.set(-0.18, 0.1, -0.68);
    const lemon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20, 1, false, 0, Math.PI * 0.85)),
      materials.lemonFlesh,
    );
    lemon.rotation.set(0.2, 0.5, Math.PI / 2);
    sideGroup.add(lemon);
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.09, 0.013, 8, 18));
    ringGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(ringGeo, materials.redOnion);
      r.position.set(0.28 + i * 0.05, 0.02, i * 0.04);
      sideGroup.add(r);
    }
    registerPart(root, sideGroup, 'Diced Red Onions & Lime Wedge', 0.82, explodableParts);
  } else if (key === 'paneer_tikka') {
    const slate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.36, 0.08)), materials.vesselAccent);
    registerPart(root, slate, 'Dark Slate Char Platter', 0, explodableParts);

    const skewerGroup = new THREE.Group();
    skewerGroup.position.y = 0.24;
    const stickGeo = trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 1.9, 10));
    stickGeo.rotateZ(Math.PI / 2);
    const paneerGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.18, 0.18));
    const pepGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.2, 0.2));

    [-0.28, 0.24].forEach((zOff, sIdx) => {
      const stick = new THREE.Mesh(stickGeo, materials.carvedWood);
      stick.position.set(0, 0, zOff);
      stick.rotation.y = sIdx === 0 ? 0.12 : -0.1;
      skewerGroup.add(stick);

      for (let i = 0; i < 4; i++) {
        const x = -0.52 + i * 0.34;
        const p = new THREE.Mesh(paneerGeo, materials.bhaturaBread);
        p.position.set(x, 0.02, zOff);
        p.rotation.set(0.2, i * 0.6, 0.1);
        skewerGroup.add(p);

        if (i < 3) {
          const pep = new THREE.Mesh(pepGeo, materials.bellPepperRed);
          pep.position.set(x + 0.17, 0.02, zOff);
          pep.rotation.y = i * 0.5;
          skewerGroup.add(pep);
        }
      }
    });
    registerPart(root, skewerGroup, 'Char-Grilled Tandoori Paneer Skewers', 0.45, explodableParts);

    const chutneyGroup = new THREE.Group();
    chutneyGroup.position.set(-0.76, 0.06, -0.56);
    chutneyGroup.add(new THREE.Mesh(trackGeo(createLatheBowlGeometry(0.27, 0.2, 0.022, 0.16)), materials.stainlessSteel));
    const mintFill = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.23, 0.18, 0.05, 28)), materials.lettuceLeaf);
    mintFill.position.y = 0.14;
    chutneyGroup.add(mintFill);
    registerPart(root, chutneyGroup, 'Fresh Green Mint Chutney Katori', 0.28, explodableParts);

    const sideGroup = new THREE.Group();
    sideGroup.position.set(0.68, 0.12, -0.56);
    const lemon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20, 1, false, 0, Math.PI * 0.85)),
      materials.lemonFlesh,
    );
    lemon.rotation.set(0.2, 0.4, Math.PI / 2);
    sideGroup.add(lemon);
    registerPart(root, sideGroup, 'Chaat Masala & Lemon Wedges', 0.78, explodableParts);
  } else if (key === 'mango_lassi') {
    const tray = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.16, 0.09)), materials.carvedWood);
    registerPart(root, tray, 'Handcrafted Oak Coaster Tray', 0, explodableParts);

    const glassGroup = new THREE.Group();
    glassGroup.position.y = 0.06;
    const glassGeo = trackGeo(new THREE.CylinderGeometry(0.32, 0.24, 1.05, 32, 1, true));
    const fillGeo = trackGeo(new THREE.CylinderGeometry(0.29, 0.22, 0.92, 32));
    [
      [-0.4, 0.54, 0.14],
      [0.4, 0.54, -0.14],
    ].forEach(([x, y, z]) => {
      const g = new THREE.Mesh(glassGeo, materials.clearGlass);
      g.position.set(x, y, z);
      const f = new THREE.Mesh(fillGeo, materials.mangoPuree);
      f.position.set(x, y - 0.04, z);
      glassGroup.add(f, g);
    });
    registerPart(root, glassGroup, 'Chilled Alphonso Mango Yogurt Lassi', 0.35, explodableParts);

    const toppingGroup = new THREE.Group();
    toppingGroup.position.y = 1.08;
    const leafGeo = trackGeo(createLeafGeometry(0.95));
    const pistGeo = trackGeo(new THREE.BoxGeometry(0.036, 0.014, 0.024));
    [
      [-0.4, 0.14],
      [0.4, -0.14],
    ].forEach(([x, z], idx) => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const p = new THREE.Mesh(pistGeo, materials.pistachioCrumb);
        p.position.set(x + Math.cos(a) * 0.1, 0, z + Math.sin(a) * 0.1);
        p.rotation.y = a;
        toppingGroup.add(p);
      }
      const mint = new THREE.Mesh(leafGeo, materials.herbLeaf);
      mint.position.set(x, 0.03, z);
      mint.rotation.set(0.3, idx * 1.2, 0.15);
      toppingGroup.add(mint);
    });
    registerPart(root, toppingGroup, 'Crushed Pistachios & Mint Sprigs', 0.8, explodableParts);

    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(1.12, 0.02, 0.32);
    spoon.rotation.y = -0.3;
    registerPart(root, spoon, 'Long Brass Lassi Spoon', 0.14, explodableParts);
  } else if (key === 'tiramisu') {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.22, 0.11)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Ceramic Dessert Plate', 0, explodableParts);

    const cakeBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.96, 0.16, 0.96)), materials.espressoSponge);
    cakeBase.position.y = 0.15;
    registerPart(root, cakeBase, 'Espresso-Soaked Savoiardi Layer', 0.24, explodableParts);

    const creamMid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.94, 0.16, 0.94)), materials.whiteButter);
    creamMid.position.y = 0.31;
    registerPart(root, creamMid, 'Whipped Mascarpone Cream Layer', 0.52, explodableParts);

    const cakeTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.96, 0.15, 0.96)), materials.espressoSponge);
    cakeTop.position.y = 0.465;
    registerPart(root, cakeTop, 'Second Espresso Ladyfinger Layer', 0.8, explodableParts);

    const creamTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.94, 0.15, 0.94)), materials.whiteButter);
    creamTop.position.y = 0.615;
    registerPart(root, creamTop, 'Top Mascarpone Velvet Frosting', 1.06, explodableParts);

    const cocoaTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.94, 0.03, 0.94)), materials.cocoaDust);
    cocoaTop.position.y = 0.705;
    registerPart(root, cocoaTop, 'Dark Dutch Cocoa Powder Dusting', 1.28, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.18, 0.02, 0.3);
    fork.rotation.y = -0.25;
    registerPart(root, fork, 'Vintage Pastry Fork', 0.14, explodableParts);
  } else if (key === 'rasmalai') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.04, 0.44, 0.04, 0.52)), materials.brushedBrass);
    registerPart(root, bowl, 'Handcrafted Brass Dessert Bowl', 0, explodableParts);

    const milk = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.84, 0.68, 0.12, 40)), materials.saffronMilk);
    milk.position.y = 0.24;
    registerPart(root, milk, 'Chilled Saffron-Cardamom Rabri Milk', 0.28, explodableParts);

    const pattyGroup = new THREE.Group();
    pattyGroup.position.y = 0.34;
    const pattyGeo = trackGeo(new THREE.SphereGeometry(0.24, 24, 16));
    pattyGeo.scale(1, 0.48, 1);
    [
      [0, 0.04, 0],
      [-0.4, 0.01, 0.22],
      [0.4, 0.01, 0.22],
      [-0.24, 0.01, -0.38],
      [0.24, 0.01, -0.38],
    ].forEach(([x, y, z]) => {
      const p = new THREE.Mesh(pattyGeo, materials.saffronMilk);
      p.position.set(x, y, z);
      pattyGroup.add(p);
    });
    registerPart(root, pattyGroup, 'Soft Spongy Chhena Patties', 0.64, explodableParts);

    const topGroup = new THREE.Group();
    topGroup.position.y = 0.48;
    const pistGeo = trackGeo(new THREE.BoxGeometry(0.04, 0.014, 0.02));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 0.05 + (i % 3) * 0.05;
      const p = new THREE.Mesh(pistGeo, materials.pistachioCrumb);
      p.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      p.rotation.y = a;
      topGroup.add(p);
    }
    const petalGeo = trackGeo(createLeafGeometry(0.55));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, materials.rosePetal);
      petal.position.set(Math.cos(a) * 0.32, -0.02, Math.sin(a) * 0.32);
      petal.rotation.set(0.2, a, 0.1);
      topGroup.add(petal);
    }
    registerPart(root, topGroup, 'Slivered Pistachios & Rose Petals', 0.98, explodableParts);

    const spoon = createSpoonGroup(materials.stainlessSteel, trackGeo);
    spoon.position.set(1.18, 0.02, 0.32);
    spoon.rotation.y = -0.3;
    registerPart(root, spoon, 'Vintage Silver Spoon', 0.14, explodableParts);
  } else if (key === 'gajar_halwa') {
    const bowl = new THREE.Mesh(trackGeo(createLatheBowlGeometry(1.08, 0.48, 0.055, 0.54)), materials.vesselPrimary);
    registerPart(root, bowl, 'Speckled Ceramic Dessert Bowl', 0, explodableParts);

    const halwaMoundGeo = trackGeo(new THREE.SphereGeometry(0.84, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46));
    halwaMoundGeo.scale(1, 0.42, 1);
    const halwa = new THREE.Mesh(halwaMoundGeo, materials.gajarHalwa);
    halwa.position.y = 0.2;
    registerPart(root, halwa, 'Slow-Braised Carrot Halwa', 0.34, explodableParts);

    const nutGroup = new THREE.Group();
    nutGroup.position.y = 0.56;
    const cashewGeo = trackGeo(new THREE.TorusGeometry(0.06, 0.025, 8, 16, Math.PI * 1.1));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const c = new THREE.Mesh(cashewGeo, materials.chickpea);
      c.position.set(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2);
      c.rotation.set(Math.PI / 2, a, 0.2);
      nutGroup.add(c);
    }
    const pistGeo = trackGeo(new THREE.BoxGeometry(0.04, 0.015, 0.025));
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4;
      const r = 0.06 + (i % 4) * 0.08;
      const p = new THREE.Mesh(pistGeo, materials.pistachioCrumb);
      p.position.set(Math.cos(a) * r, 0.01, Math.sin(a) * r);
      p.rotation.y = a;
      nutGroup.add(p);
    }
    registerPart(root, nutGroup, 'Roasted Cashews, Almonds & Pistachios', 0.8, explodableParts);

    const spoon = createSpoonGroup(materials.stainlessSteel, trackGeo);
    spoon.position.set(1.2, 0.02, 0.34);
    spoon.rotation.y = -0.3;
    registerPart(root, spoon, 'Vintage Dessert Spoon', 0.14, explodableParts);
  } else if (key === 'lava_cake') {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.26, 0.11)), materials.vesselPrimary);
    registerPart(root, plate, 'Speckled Ceramic Dessert Plate', 0, explodableParts);

    const cake = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.46, 0.5, 0.44, 32)), materials.cocoaDust);
    cake.position.set(-0.08, 0.28, 0);
    registerPart(root, cake, 'Warm Dark Chocolate Sponge', 0.3, explodableParts);

    const lavaPool = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.32, 0.38, 0.04, 28)),
      materials.moltenChocolate,
    );
    lavaPool.position.set(0.28, 0.09, 0.24);
    registerPart(root, lavaPool, 'Flowing Molten Ganache Center', 0.58, explodableParts);

    const berryGroup = new THREE.Group();
    berryGroup.position.set(0.44, 0.14, -0.18);
    const berryGeo = trackGeo(new THREE.SphereGeometry(0.085, 16, 12));
    [
      [0, 0, 0],
      [0.14, 0, 0.1],
      [-0.08, 0, 0.14],
      [0.06, 0.09, 0.06],
    ].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(berryGeo, materials.raspberryFruit);
      b.position.set(x, y, z);
      berryGroup.add(b);
    });
    const mint = new THREE.Mesh(trackGeo(createLeafGeometry(1.0)), materials.herbLeaf);
    mint.position.set(0.04, 0.16, 0.04);
    mint.rotation.set(0.3, 0.5, 0.1);
    berryGroup.add(mint);
    registerPart(root, berryGroup, 'Fresh Raspberries & Mint Sprig', 0.88, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.18, 0.02, 0.3);
    fork.rotation.y = -0.25;
    registerPart(root, fork, 'Vintage Pastry Fork', 0.14, explodableParts);
  } else if (key === 'masala_chai') {
    const tray = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.18, 0.09)), materials.carvedWood);
    registerPart(root, tray, 'Handcrafted Oak Tea Tray', 0, explodableParts);

    const cupGeo = trackGeo(createLatheBowlGeometry(0.34, 0.58, 0.032, 0.22));
    const fillGeo = trackGeo(new THREE.CylinderGeometry(0.3, 0.24, 0.1, 28));
    const cupGroup = new THREE.Group();
    [
      [-0.4, 0.06, 0.14],
      [0.4, 0.06, -0.16],
    ].forEach(([x, y, z]) => {
      const c = new THREE.Mesh(cupGeo, materials.terracottaClay);
      c.position.set(x, y, z);
      cupGroup.add(c);
    });
    registerPart(root, cupGroup, 'Terracotta Kulhad Clay Cups', 0.22, explodableParts);

    const teaGroup = new THREE.Group();
    [
      [-0.4, 0.52, 0.14],
      [0.4, 0.52, -0.16],
    ].forEach(([x, y, z]) => {
      const f = new THREE.Mesh(fillGeo, materials.chaiTea);
      f.position.set(x, y, z);
      teaGroup.add(f);
    });
    registerPart(root, teaGroup, 'Steaming Ginger-Cardamom Masala Chai', 0.58, explodableParts);

    const spiceGroup = new THREE.Group();
    spiceGroup.position.set(0.22, 0.12, 0.58);
    const cinGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.42, 12));
    cinGeo.rotateZ(Math.PI / 2);
    const cin1 = new THREE.Mesh(cinGeo, materials.creminiMushroom);
    cin1.rotation.y = 0.35;
    const podGeo = trackGeo(new THREE.SphereGeometry(0.035, 10, 8));
    podGeo.scale(1.4, 0.9, 0.9);
    for (let i = 0; i < 4; i++) {
      const pod = new THREE.Mesh(podGeo, materials.pistachioCrumb);
      pod.position.set(-0.22 + i * 0.09, 0.02, 0.12 + (i % 2) * 0.06);
      pod.rotation.y = i * 0.7;
      spiceGroup.add(pod);
    }
    spiceGroup.add(cin1);
    registerPart(root, spiceGroup, 'Whole Cardamom & Cinnamon Stick', 0.85, explodableParts);

    const spoon = createSpoonGroup(materials.brushedBrass, trackGeo);
    spoon.position.set(1.12, 0.02, 0.3);
    spoon.rotation.y = -0.32;
    registerPart(root, spoon, 'Handcrafted Brass Tea Spoon', 0.14, explodableParts);
  } else if (key === 'nimbu_pani') {
    const tray = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.18, 0.09)), materials.carvedWood);
    registerPart(root, tray, 'Rustic Oak Drink Coaster Tray', 0, explodableParts);

    const glassGroup = new THREE.Group();
    glassGroup.position.y = 0.06;
    const glassGeo = trackGeo(new THREE.CylinderGeometry(0.3, 0.25, 1.08, 32, 1, true));
    const fillGeo = trackGeo(new THREE.CylinderGeometry(0.27, 0.23, 0.92, 32));
    [
      [-0.4, 0.56, 0.12],
      [0.4, 0.56, -0.14],
    ].forEach(([x, y, z]) => {
      const g = new THREE.Mesh(glassGeo, materials.clearGlass);
      g.position.set(x, y, z);
      const f = new THREE.Mesh(fillGeo, materials.limeJuice);
      f.position.set(x, y - 0.04, z);
      glassGroup.add(f, g);
    });
    registerPart(root, glassGroup, 'Chilled Sparkling Mint Limeade', 0.34, explodableParts);

    const garnishGroup = new THREE.Group();
    garnishGroup.position.y = 1.08;
    const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20));
    const leafGeo = trackGeo(createLeafGeometry(0.9));
    [
      [-0.4, 0.12],
      [0.4, -0.14],
    ].forEach(([x, z], idx) => {
      const wheel = new THREE.Mesh(wheelGeo, materials.lemonFlesh);
      wheel.position.set(x + 0.22, 0.02, z);
      wheel.rotation.set(0.3, idx * 0.8, Math.PI / 2.2);
      const mint = new THREE.Mesh(leafGeo, materials.herbLeaf);
      mint.position.set(x - 0.05, 0.05, z);
      mint.rotation.set(0.25, idx * 1.1, 0.15);
      garnishGroup.add(wheel, mint);
    });
    registerPart(root, garnishGroup, 'Fresh Lime Wheels & Garden Mint', 0.82, explodableParts);
  } else if (key === 'matcha_latte') {
    const tray = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.12, 0.08)), materials.carvedWood);
    registerPart(root, tray, 'Minimalist Oak Café Tray', 0, explodableParts);

    const glass = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.32, 0.28, 1.12, 32, 1, true)),
      materials.clearGlass,
    );
    glass.position.y = 0.62;
    registerPart(root, glass, 'Tall Café Glass', 0.18, explodableParts);

    const milkLayer = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.29, 0.25, 0.56, 32)),
      materials.oatMilk,
    );
    milkLayer.position.y = 0.38;
    registerPart(root, milkLayer, 'Chilled Creamy Oat Milk Base', 0.44, explodableParts);

    const matchaLayer = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.3, 0.29, 0.36, 32)),
      materials.matchaGreen,
    );
    matchaLayer.position.y = 0.84;
    registerPart(root, matchaLayer, 'Ceremonial Whisked Matcha Shot', 0.78, explodableParts);

    const iceGroup = new THREE.Group();
    iceGroup.position.y = 0.96;
    const iceGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.14, 0.14));
    [
      [-0.08, 0.04, 0.06, 0.3],
      [0.1, 0.06, -0.05, -0.4],
      [0, 0.05, -0.1, 0.8],
    ].forEach(([x, y, z, rot]) => {
      const cube = new THREE.Mesh(iceGeo, materials.clearGlass);
      cube.position.set(x, y, z);
      cube.rotation.set(0.2, rot, 0.3);
      iceGroup.add(cube);
    });
    registerPart(root, iceGroup, 'Crystal Ice Cubes', 1.1, explodableParts);

    const spoon = createSpoonGroup(materials.carvedWood, trackGeo);
    spoon.position.set(1.06, 0.02, 0.32);
    spoon.rotation.y = -0.28;
    registerPart(root, spoon, 'Carved Bamboo Stirrer Spoon', 0.14, explodableParts);
  } else {
    const plate = new THREE.Mesh(trackGeo(createLathePlateGeometry(1.22, 0.13)), materials.vesselPrimary);
    registerPart(root, plate, 'Artisan Ceramic Serving Plate', 0, explodableParts);

    const baseGeo = trackGeo(new THREE.CylinderGeometry(0.75, 0.7, 0.14, 36));
    const baseMat =
      recipe.category.toLowerCase() === 'breakfast'
        ? materials.pancakeCrumb
        : recipe.category.toLowerCase() === 'lunch'
          ? materials.lettuceLeaf
          : materials.curryGravy;
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.12;
    registerPart(root, base, `${recipe.name} Base Layer`, 0.3, explodableParts);

    const medGeo = trackGeo(new THREE.SphereGeometry(0.28, 24, 16));
    medGeo.scale(1.4, 0.55, 1.1);
    const centerpiece = new THREE.Mesh(medGeo, materials.mozzarella);
    centerpiece.position.y = 0.24;
    registerPart(root, centerpiece, `${recipe.name} Centerpiece`, 0.6, explodableParts);

    const garnishGroup = new THREE.Group();
    garnishGroup.position.y = 0.34;
    const leafGeo = trackGeo(createLeafGeometry(1.1));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, materials.herbLeaf);
      leaf.position.set(Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22);
      leaf.rotation.set(0.2, a, 0.1);
      garnishGroup.add(leaf);
    }
    registerPart(root, garnishGroup, 'Fresh Herb Garnish', 0.9, explodableParts);

    const fork = createForkGroup(materials.stainlessSteel, trackGeo);
    fork.position.set(1.2, 0.02, 0.3);
    fork.rotation.y = -0.22;
    registerPart(root, fork, 'Brushed Steel Fork', 0.14, explodableParts);
  }

  return {
    root,
    explodableParts,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
    },
  };
}
