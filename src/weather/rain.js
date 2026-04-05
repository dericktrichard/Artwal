import * as THREE from 'three';
import { scene } from '../scene/setup.js';

let rainSystem = null;
let raining = false;
const rainCount = 4000;

export function initRain() {
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 100;
    rainPos[i * 3 + 1] = Math.random() * 60;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }
  
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0xaaccff,
    size: 0.1,
    transparent: true,
    opacity: 0.6
  });
  
  rainSystem = new THREE.Points(rainGeo, rainMat);
  rainSystem.visible = false;
  scene.add(rainSystem);
}

export function toggleRain() {
  raining = !raining;
  if (rainSystem) rainSystem.visible = raining;
  return raining;
}

export function isRaining() { return raining; }

export function updateRain(playerPos) {
  if (!raining || !rainSystem) return;
  
  const positions = rainSystem.geometry.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    positions[i*3+1] -= 0.6;
    if (positions[i*3+1] < 0) {
      positions[i*3+1] = 50;
      positions[i*3] = playerPos.x + (Math.random()-0.5)*80;
      positions[i*3+2] = playerPos.z + (Math.random()-0.5)*80;
    }
  }
  rainSystem.geometry.attributes.position.needsUpdate = true;
}