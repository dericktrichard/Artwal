import * as THREE from 'three';
import { scene } from '../scene/setup.js';

const coatMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
const darkMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
const hpMat = new THREE.MeshBasicMaterial({ color: 0xe8c547 });

export const charGroup = new THREE.Group();
export let umbrella = null;

export function createCharacter() {
  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.35), coatMat);
  body.position.y = 1.1;
  body.castShadow = true;
  charGroup.add(body);
  
  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.35), skinMat);
  head.position.y = 1.75;
  charGroup.add(head);
  
  // Headphones
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.15), hpMat);
  earL.position.set(-0.2, 1.75, 0);
  charGroup.add(earL);
  const earR = earL.clone();
  earR.position.set(0.2, 1.75, 0);
  charGroup.add(earR);
  
  const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.03, 6, 12, Math.PI),
    hpMat
  );
  hpBand.position.y = 1.95;
  hpBand.rotation.z = Math.PI / 2;
  charGroup.add(hpBand);
  
  // Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), darkMat);
  legL.position.set(-0.16, 0.375, 0);
  charGroup.add(legL);
  
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), darkMat);
  legR.position.set(0.16, 0.375, 0);
  charGroup.add(legR);
  
  // Arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), coatMat);
  armL.position.set(-0.42, 1.3, 0);
  charGroup.add(armL);
  
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), coatMat);
  armR.position.set(0.42, 1.3, 0);
  charGroup.add(armR);
  
  // Umbrella
  umbrella = new THREE.Group();
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 0.4, 8, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  canopy.position.y = 1.3;
  umbrella.add(canopy);
  
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8),
    new THREE.MeshBasicMaterial({ color: 0x8b4513 })
  );
  handle.position.y = 0.6;
  umbrella.add(handle);
  
  umbrella.position.set(0.25, 1.3, 0.3);
  umbrella.rotation.z = -0.2;
  umbrella.visible = false;
  charGroup.add(umbrella);
  
  scene.add(charGroup);
}

export function updateCharacterAnimation(walkCycle, hasUmbrella) {
  const legL = charGroup.children[4];
  const legR = charGroup.children[5];
  const armL = charGroup.children[6];
  const armR = charGroup.children[7];
  
  legL.rotation.x = Math.sin(walkCycle) * 0.5;
  legR.rotation.x = -Math.sin(walkCycle) * 0.5;
  armL.rotation.x = -Math.sin(walkCycle) * 0.3;
  
  if (hasUmbrella) {
    armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -0.4, 0.1);
    armR.rotation.z = 0.2;
  } else {
    armR.rotation.x = Math.sin(walkCycle) * 0.3;
    armR.rotation.z = 0;
  }
  
  charGroup.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.03;
}

export function toggleUmbrella(show) {
  if (umbrella) umbrella.visible = show;
}