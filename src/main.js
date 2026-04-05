import './style.css';
import * as THREE from 'three';

import { renderer, camera, scene, handleResize } from './scene/setup.js';
import { cycleTime } from './scene/lighting.js';
import { createGround, createStreets } from './world/ground.js';
import { generateCity, buildings, interactables } from './world/buildings.js';
import { generateStreetLights } from './world/furniture.js';
import { initRain, toggleRain, isRaining, updateRain } from './weather/rain.js';
import { createCharacter, charGroup, updateCharacterAnimation, toggleUmbrella } from './character/player.js';
import { keys, camState, initInput } from './input/controls.js';
import { updateWeatherDisplay, showDiscovery, hideDiscovery, updateMusic, updateMusicProgress, resetMusic, hideLoading } from './ui/display.js';

// Init world
createGround();
createStreets();
generateCity();
generateStreetLights();
createCharacter();
initRain();
initInput(document.getElementById('c'));

// Player state
const player = {
  pos: new THREE.Vector3(0, 0, 0),
  rot: 0,
  speed: 5,
  sprintSpeed: 10
};

let walkCycle = 0;
let currentTrack = null;
let trackStart = 0;
let nearbyInteractable = null;

// Fixed: Use performance.now() instead of THREE.Clock
let lastTime = performance.now();

// Key handlers
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    const raining = toggleRain();
    toggleUmbrella(raining);
    updateWeatherDisplay((raining ? '🌧 ' : '☀ ') + 'Dawn');
  }
  if (e.code === 'KeyT') {
    const display = cycleTime(scene, isRaining());
    updateWeatherDisplay(display);
  }
});

// Game loop
function update() {
  requestAnimationFrame(update);
  
  // Fixed: Manual delta time calculation
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  
  // Movement
  let moveX = 0, moveZ = 0;
  if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
  
  const isMoving = moveX !== 0 || moveZ !== 0;
  const sprint = keys['ShiftLeft'] || keys['ShiftRight'];
  const speed = sprint ? player.sprintSpeed : player.speed;
  
  if (isMoving) {
    const len = Math.sqrt(moveX*moveX + moveZ*moveZ);
    moveX /= len; moveZ /= len;
    
    const fx = Math.sin(camState.yaw);
    const fz = Math.cos(camState.yaw);
    const rx = Math.cos(camState.yaw);
    const rz = -Math.sin(camState.yaw);
    
    const wx = fx * -moveZ + rx * moveX;
    const wz = fz * -moveZ + rz * moveX;
    
    player.rot = Math.atan2(wx, wz);
    
    const newX = player.pos.x + wx * speed * dt;
    const newZ = player.pos.z + wz * speed * dt;
    
    let collideX = false, collideZ = false;
    for (const b of buildings) {
      const bound = b.userData.bounds;
      if (Math.abs(newX - bound.x) < bound.w && Math.abs(player.pos.z - bound.z) < bound.d) collideX = true;
      if (Math.abs(player.pos.x - bound.x) < bound.w && Math.abs(newZ - bound.z) < bound.d) collideZ = true;
    }
    
    if (!collideX) player.pos.x = newX;
    if (!collideZ) player.pos.z = newZ;
    
    walkCycle += dt * (sprint ? 12 : 8);
  } else {
    walkCycle *= 0.9;
  }
  
  // Update character
  charGroup.position.x = player.pos.x;
  charGroup.position.z = player.pos.z;
  charGroup.rotation.y = player.rot;
  
  // Updated animation with dt
  updateCharacterAnimation(walkCycle, isRaining(), dt);
  
  // Camera
  if (camState.locked) {
    const targetYaw = player.rot + Math.PI;
    let diff = targetYaw - camState.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    camState.yaw += diff * 4 * dt;
  }
  
  const camX = player.pos.x + Math.sin(camState.yaw) * camState.dist * Math.cos(camState.pitch);
  const camZ = player.pos.z + Math.cos(camState.yaw) * camState.dist * Math.cos(camState.pitch);
  const camY = 1.6 + Math.sin(camState.pitch) * camState.dist;
  
  camera.position.set(camX, camY, camZ);
  camera.lookAt(player.pos.x, 1.4, player.pos.z);
  
  // Weather
  updateRain(player.pos);
  
  // Interactions
  let found = false;
  for (const item of interactables) {
    if (!item.userData.interactPos) continue;
    const d = player.pos.distanceTo(item.userData.interactPos);
    if (d < 6) {
      found = true;
      if (nearbyInteractable !== item) {
        nearbyInteractable = item;
        const content = item.userData.content;
        
        if (content.type === 'poem') {
          showDiscovery('POETRY', content.data.text.replace(/\n/g, '<br>'), '— ' + content.data.author);
        } else {
          showDiscovery('MUSIC', content.data.name, content.data.genre);
          currentTrack = content.data;
          trackStart = Date.now();
          updateMusic(content.data.name);
        }
      }
      break;
    }
  }
  
  if (!found && nearbyInteractable) {
    nearbyInteractable = null;
    hideDiscovery();
  }
  
  // Music progress
  if (currentTrack) {
    const elapsed = (Date.now() - trackStart) / 1000;
    if (elapsed > currentTrack.duration) {
      currentTrack = null;
      resetMusic();
    } else {
      updateMusicProgress((elapsed / currentTrack.duration) * 100);
    }
  }
  
  renderer.render(scene, camera);
}

// Start
hideLoading();
update();
window.addEventListener('resize', handleResize);