import * as THREE from 'three';
import { scene } from '../scene/setup.js';

export function addStreetLamp(x, z) {
  const group = new THREE.Group();
  
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 5, 8),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  pole.position.y = 2.5;
  group.add(pole);
  
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xffeebb })
  );
  head.position.y = 5;
  group.add(head);
  
  const light = new THREE.PointLight(0xffaa44, 2, 15);
  light.position.set(0, 4.5, 0);
  group.add(light);
  
  group.position.set(x, 0, z);
  scene.add(group);
}

export function generateStreetLights() {
  for (let z = -120; z <= 120; z += 25) {
    addStreetLamp(-7, z);
    addStreetLamp(7, z);
  }
}