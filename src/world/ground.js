import * as THREE from 'three';
import { scene } from '../scene/setup.js';

const streetMat = new THREE.MeshLambertMaterial({ 
  color: 0x2a2a2a,
  emissive: 0xe8c547,
  emissiveIntensity: 0.02
});

export function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function createStreets() {
  // Main avenue
  const street1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 400), streetMat);
  street1.rotation.x = -Math.PI / 2;
  street1.position.y = 0.01;
  scene.add(street1);
  
  // Cross street
  const street2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 8), streetMat);
  street2.rotation.x = -Math.PI / 2;
  street2.position.y = 0.01;
  scene.add(street2);
}