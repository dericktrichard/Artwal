import * as THREE from 'three';
import { scene } from '../scene/setup.js';
import { POEMS, createPoemTexture } from '../content/poetry.js';
import { TRACKS, createMusicTexture } from '../content/music.js';

export const buildings = [];
export const interactables = [];

const winLit = new THREE.MeshBasicMaterial({ color: 0xffeaa7 });
const winDark = new THREE.MeshBasicMaterial({ color: 0x111111 });

export function createBuilding(x, z) {
  const height = 15 + Math.random() * 20;
  const width = 10 + Math.random() * 4;
  const depth = 8 + Math.random() * 4;
  
  const group = new THREE.Group();
  
  // Main building
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  
  // Windows
  const winGeo = new THREE.PlaneGeometry(1.2, 1.8);
  const cols = Math.max(2, Math.floor(width / 2.5));
  const rows = Math.floor(height / 3);
  
  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = -width/2 + (width/(cols+1)) * (c+1);
      const wy = r * 3;
      const isLit = Math.random() > 0.6;
      
      const win = new THREE.Mesh(winGeo, isLit ? winLit : winDark);
      win.position.set(wx, wy, depth/2 + 0.05);
      group.add(win);
      
      const win2 = win.clone();
      win2.position.set(wx, wy, -depth/2 - 0.05);
      win2.rotation.y = Math.PI;
      group.add(win2);
    }
  }
  
  // Add content (25% chance)
  if (Math.random() < 0.25) {
    const isPoem = Math.random() > 0.5;
    
    if (isPoem) {
      // Poem
      const poem = POEMS[Math.floor(Math.random() * POEMS.length)];
      const tex = createPoemTexture(poem);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
      plane.position.set(0, height * 0.6, depth/2 + 0.1);
      group.add(plane);
      
      group.userData.content = { type: 'poem', data: poem };
    } else {
      // Music
      const track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
      const tex = createMusicTexture(track);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
      plane.position.set(0, height * 0.7, depth/2 + 0.1);
      group.add(plane);
      
      // Glow light for music
      const glow = new THREE.PointLight(0xe8c547, 0.5, 5);
      glow.position.set(0, height * 0.7, depth/2 + 1);
      group.add(glow);
      
      group.userData.content = { type: 'music', data: track };
    }
    
    group.userData.interactPos = new THREE.Vector3(x, height * 0.6, z + depth/2);
    interactables.push(group);
  }
  
  group.position.set(x, 0, z);
  scene.add(group);
  
  group.userData.bounds = { x, z, w: width/2 + 0.6, d: depth/2 + 0.6 };
  buildings.push(group);
}

export function generateCity() {
  for (let z = -120; z <= 120; z += 30) {
    createBuilding(-15, z);
    createBuilding(15, z);
  }
  for (let x = -60; x <= 60; x += 40) {
    if (Math.abs(x) < 20) continue;
    createBuilding(x, 0);
    createBuilding(x, 40);
    createBuilding(x, -40);
  }
}