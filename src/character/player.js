import * as THREE from 'three';
import { scene } from '../scene/setup.js';

// Materials
const coatMat = new THREE.MeshStandardMaterial({ 
  color: 0x3d4550,
  roughness: 0.7,
  metalness: 0.1
});
const skinMat = new THREE.MeshStandardMaterial({ 
  color: 0xd4a574,
  roughness: 0.5 
});
const darkMat = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a1a,
  roughness: 0.9 
});
const hpMat = new THREE.MeshStandardMaterial({ 
  color: 0xe8c547,
  roughness: 0.3,
  metalness: 0.6,
  emissive: 0xe8c547,
  emissiveIntensity: 0.1
});
const scarfMat = new THREE.MeshStandardMaterial({
  color: 0x8b4513,
  roughness: 0.9
});
const shoeMat = new THREE.MeshStandardMaterial({ 
  color: 0x0a0a0a, 
  roughness: 0.5 
});

export const charGroup = new THREE.Group();
export let umbrella = null;
let legL, legR, armL, armR, body, coatTail;

export function createCharacter() {
  // Body Group (Trench Coat)
  const bodyGroup = new THREE.Group();
  
  // Main torso
  body = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.9, 0.4),
    coatMat
  );
  body.position.y = 1.15;
  body.castShadow = true;
  bodyGroup.add(body);
  
  // Coat tails (back flap)
  coatTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.6, 0.1),
    coatMat
  );
  coatTail.position.set(0, 0.7, 0.25);
  coatTail.rotation.x = 0.15;
  coatTail.castShadow = true;
  bodyGroup.add(coatTail);
  
  // Coat collar
  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.2, 0.45),
    coatMat
  );
  collar.position.set(0, 1.6, 0);
  collar.rotation.x = 0.2;
  bodyGroup.add(collar);
  
  // Scarf
  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.08, 8, 16),
    scarfMat
  );
  scarf.position.set(0, 1.55, 0);
  scarf.rotation.x = Math.PI / 2;
  bodyGroup.add(scarf);
  
  charGroup.add(bodyGroup);
  
  // Head Group
  const headGroup = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.42, 0.38),
    skinMat
  );
  head.position.y = 1.78;
  head.castShadow = true;
  headGroup.add(head);
  
  // Hair
  const hair = new THREE.Mesh(
    new THREE.BoxGeometry(0.37, 0.15, 0.4),
    darkMat
  );
  hair.position.set(0, 1.95, 0);
  headGroup.add(hair);
  
  charGroup.add(headGroup);
  
  // Premium Headphones
  const hpGroup = new THREE.Group();
  
  const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.04, 8, 20, Math.PI),
    hpMat
  );
  hpBand.position.y = 2.0;
  hpBand.rotation.z = Math.PI / 2;
  hpGroup.add(hpBand);
  
  const cupGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
  const cupL = new THREE.Mesh(cupGeo, hpMat);
  cupL.position.set(-0.24, 1.78, 0);
  cupL.rotation.z = Math.PI / 2;
  cupL.castShadow = true;
  hpGroup.add(cupL);
  
  const cupR = cupL.clone();
  cupR.position.set(0.24, 1.78, 0);
  hpGroup.add(cupR);
  
  // LED indicator
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.02, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  led.position.set(0.24, 1.9, 0.08);
  hpGroup.add(led);
  
  charGroup.add(hpGroup);
  
  // Legs Group
  const legGroup = new THREE.Group();
  
  legL = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.8, 0.24),
    darkMat
  );
  legL.position.set(-0.17, 0.4, 0);
  legL.castShadow = true;
  legGroup.add(legL);
  
  legR = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.8, 0.24),
    darkMat
  );
  legR.position.set(0.17, 0.4, 0);
  legR.castShadow = true;
  legGroup.add(legR);
  
  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.24, 0.15, 0.35);
  const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
  shoeL.position.set(-0.17, 0.075, 0.05);
  shoeL.castShadow = true;
  legGroup.add(shoeL);
  
  const shoeR = shoeL.clone();
  shoeR.position.set(0.17, 0.075, 0.05);
  legGroup.add(shoeR);
  
  charGroup.add(legGroup);
  
  // Arms Group
  const armGroup = new THREE.Group();
  
  armL = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.7, 0.18),
    coatMat
  );
  armL.position.set(-0.45, 1.25, 0);
  armL.castShadow = true;
  armGroup.add(armL);
  
  const handL = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.15),
    skinMat
  );
  handL.position.set(-0.45, 0.85, 0);
  armGroup.add(handL);
  
  armR = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.7, 0.18),
    coatMat
  );
  armR.position.set(0.45, 1.25, 0);
  armR.castShadow = true;
  armGroup.add(armR);
  
  const handR = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.15),
    skinMat
  );
  handR.position.set(0.45, 0.85, 0);
  armGroup.add(handR);
  
  charGroup.add(armGroup);
  
  // Enhanced Umbrella
  umbrella = new THREE.Group();
  
  const canopyGeo = new THREE.ConeGeometry(1.0, 0.35, 10, 1, true);
  const canopyMat = new THREE.MeshStandardMaterial({ 
    color: 0x2d3436, 
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0.2
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 1.4;
  canopy.castShadow = true;
  umbrella.add(canopy);
  
  const handleCurve = new THREE.Group();
  const handleStraight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 })
  );
  handleStraight.position.y = 0.5;
  handleCurve.add(handleStraight);
  
  const curve = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.025, 6, 8, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  curve.position.set(0, 0, 0.08);
  curve.rotation.x = Math.PI / 2;
  handleCurve.add(curve);
  
  handleCurve.position.y = 0.5;
  umbrella.add(handleCurve);
  
  umbrella.position.set(0.35, 1.3, 0.25);
  umbrella.rotation.z = -0.15;
  umbrella.visible = false;
  charGroup.add(umbrella);
  
  charGroup.userData.breathOffset = 0;
  
  scene.add(charGroup);
}

export function updateCharacterAnimation(walkCycle, hasUmbrella, dt) {
  if (!legL || !body) return;
  
  // Breathing animation
  charGroup.userData.breathOffset += dt * 2;
  const breath = Math.sin(charGroup.userData.breathOffset) * 0.01;
  body.scale.y = 1 + breath;
  body.position.y = 1.15 + breath * 0.5;
  
  if (walkCycle > 0.1) {
    const legSwing = Math.sin(walkCycle) * 0.6;
    const armSwing = Math.sin(walkCycle) * 0.4;
    
    legL.rotation.x = legSwing;
    legR.rotation.x = -legSwing;
    
    if (hasUmbrella) {
      armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -0.5, 0.1);
      armR.rotation.z = 0.3;
      armL.rotation.x = -legSwing * 0.5;
    } else {
      armL.rotation.x = -armSwing;
      armR.rotation.x = armSwing;
      armR.rotation.z = 0;
    }
    
    charGroup.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.05;
    
    if (coatTail) {
      coatTail.rotation.x = 0.15 + Math.sin(walkCycle) * 0.05;
    }
  } else {
    legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.1);
    legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.1);
    armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, 0, 0.1);
    
    if (hasUmbrella) {
      armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -0.3, 0.1);
      armR.rotation.z = 0.2;
    } else {
      armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, 0, 0.1);
      armR.rotation.z = THREE.MathUtils.lerp(armR.rotation.z, 0, 0.1);
    }
    
    charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, 0, 0.1);
  }
}

export function toggleUmbrella(show) {
  if (umbrella) umbrella.visible = show;
}