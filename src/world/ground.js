import * as THREE from 'three';
import { scene } from '../scene/setup.js';

// Materials
let dryStreetMat, wetStreetMat, currentStreetMesh, groundMesh;

export function createGround() {
  groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1
    })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  
  // Initialize street materials
  createStreetMaterials();
}

function createStreetMaterials() {
  // Dry street - normal rough asphalt
  dryStreetMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0xe8c547,
    emissiveIntensity: 0.02
  });
  
  // Wet street - reflective, glossy
  wetStreetMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,  // Darker when wet
    roughness: 0.1,    // Very smooth for reflections
    metalness: 0.6,    // Reflective
    emissive: 0xe8c547,
    emissiveIntensity: 0.05,  // Stronger glow when wet
    envMapIntensity: 1.5
  });
}

export function createStreets() {
  // Main avenue
  const street1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 400), dryStreetMat);
  street1.rotation.x = -Math.PI / 2;
  street1.position.y = 0.02;
  street1.name = 'street-main';
  scene.add(street1);
  
  // Cross street
  const street2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 8), dryStreetMat);
  street2.rotation.x = -Math.PI / 2;
  street2.position.y = 0.02;
  street2.name = 'street-cross';
  scene.add(street2);
  
  currentStreetMesh = [street1, street2];
}

export function setWetGround(isWet) {
  const mat = isWet ? wetStreetMat : dryStreetMat;
  
  // Update street materials
  scene.traverse((child) => {
    if (child.name && child.name.startsWith('street-')) {
      child.material = mat;
    }
  });
  
  // Update ground to be slightly darker when wet
  if (groundMesh) {
    groundMesh.material.color.setHex(isWet ? 0x151515 : 0x1a1a1a);
    groundMesh.material.roughness = isWet ? 0.3 : 0.9;
    groundMesh.material.metalness = isWet ? 0.4 : 0.1;
  }
  
  console.log('Ground state:', isWet ? 'WET (reflective)' : 'DRY');
}

// Add puddles when it rains
export function createPuddles() {
  const puddleGeo = new THREE.CircleGeometry(2 + Math.random() * 2, 16);
  const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.05,
    metalness: 0.8,
    transparent: true,
    opacity: 0.8
  });
  
  // Add random puddles along streets
  for (let i = 0; i < 15; i++) {
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(
      (Math.random() - 0.5) * 10,  // Along street width
      0.03,
      (Math.random() - 0.5) * 200   // Along street length
    );
    puddle.name = 'puddle';
    puddle.visible = false;  // Hidden by default
    scene.add(puddle);
  }
}

export function togglePuddles(show) {
  scene.traverse((child) => {
    if (child.name === 'puddle') {
      child.visible = show;
    }
  });
}