import './style.css';
import * as THREE from 'three';
import { audioManager } from './audio/AudioManager.js';

import { renderer, camera, scene, handleResize } from './scene/setup.js';
import { cycleTime } from './scene/lighting.js';
import { createGround, createStreets, createPuddles, setWetGround, togglePuddles } from './world/ground.js';
import { generateCity, buildings, interactables } from './world/buildings.js';
import { generateStreetLights } from './world/furniture.js';
import { initRain, toggleRain, isRaining, updateRain } from './weather/rain.js';
import { createCharacter, charGroup, updateCharacterAnimation, toggleUmbrella } from './character/player.js';
import { keys, camState, initInput } from './input/controls.js';
import { updateWeatherDisplay, showDiscovery, hideDiscovery, updateMusic, updateMusicProgress, resetMusic, hideLoading } from './ui/display.js';

// Init world
createGround();
createStreets();
createPuddles();
generateCity();
generateStreetLights();
createCharacter();

// Init rain with callbacks for wet ground
initRain(
  () => { // On rain start
    setWetGround(true);
    togglePuddles(true);
  },
  () => { // On rain end
    setWetGround(false);
    togglePuddles(false);
  }
);

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

// Use performance.now() instead of deprecated THREE.Clock
let lastTime = performance.now();

// Key handlers
window.addEventListener('keydown', (e) => {
  // Rain toggle
  if (e.code === 'Space') {
    const raining = toggleRain();
    toggleUmbrella(raining);
    updateWeatherDisplay((raining ? '🌧 ' : '☀ ') + 'Dawn');
  }
  
  // Time cycle
  if (e.code === 'KeyT') {
    const display = cycleTime(scene, isRaining());
    updateWeatherDisplay(display);
  }
  
  // Stop music
  if (e.code === 'KeyM') {
    audioManager.stop();
    resetMusic();
  }
});

// Game loop
function update() {
  requestAnimationFrame(update);
  
  // Manual delta time calculation
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  
  // Movement input
  let moveX = 0, moveZ = 0;
  if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
  
  const isMoving = moveX !== 0 || moveZ !== 0;
  const sprint = keys['ShiftLeft'] || keys['ShiftRight'];
  const speed = sprint ? player.sprintSpeed : player.speed;
  
  if (isMoving) {
    // Normalize input
    const len = Math.sqrt(moveX*moveX + moveZ*moveZ);
    moveX /= len;
    moveZ /= len;
    
    // FIXED: Camera-relative movement (removed the - that was reversing it)
    const forwardX = Math.sin(camState.yaw);
    const forwardZ = Math.cos(camState.yaw);
    const rightX = Math.cos(camState.yaw);
    const rightZ = -Math.sin(camState.yaw);
    
    const worldX = forwardX * moveZ + rightX * moveX;
    const worldZ = forwardZ * moveZ + rightZ * moveX;
    
    player.rot = Math.atan2(worldX, worldZ);
    
    // Collision detection
    const newX = player.pos.x + worldX * speed * dt;
    const newZ = player.pos.z + worldZ * speed * dt;
    
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
  
  // Update character position and animation
  charGroup.position.copy(player.pos);
  charGroup.rotation.y = player.rot;
  updateCharacterAnimation(walkCycle, isRaining(), dt);
  
  // Camera follow with smooth auto-rotation when locked
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
  
  // Update weather effects
  updateRain(player.pos);
  
  // Check interactions with poetry/music
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
        } else if (content.type === 'music') {
          showDiscovery('MUSIC', content.data.name, content.data.genre);
          currentTrack = content.data;
          trackStart = Date.now();
          updateMusic(content.data.name);
          audioManager.play(content.data.name);
        }
      }
      break;
    }
  }
  
  // Hide discovery panel when walking away
  if (!found && nearbyInteractable) {
    nearbyInteractable = null;
    hideDiscovery();
  }
  
  // Update music progress bar
  if (currentTrack) {
    const elapsed = (Date.now() - trackStart) / 1000;
    if (elapsed > currentTrack.duration) {
      currentTrack = null;
      resetMusic();
      audioManager.stop();
    } else {
      updateMusicProgress((elapsed / currentTrack.duration) * 100);
    }
  }
  
  renderer.render(scene, camera);
}

// Hide loading screen and start
hideLoading();
update();

// Handle window resize
window.addEventListener('resize', handleResize);