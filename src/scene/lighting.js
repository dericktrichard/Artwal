import * as THREE from 'three';
import { scene } from './setup.js';

export const sunLight = new THREE.DirectionalLight(0xff6b35, 1.5);
sunLight.position.set(50, 40, -50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
scene.add(sunLight);

export const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
scene.add(ambientLight);

export const TIME_PRESETS = {
  dawn:   { sky: 0x1a1a2e, fog: 0x1a1a2e, sun: 0xff6b35, intensity: 1.5, name: 'Dawn' },
  morning:{ sky: 0x87ceeb, fog: 0x87ceeb, sun: 0xffd700, intensity: 2.0, name: 'Morning' },
  noon:   { sky: 0x6ecfff, fog: 0x6ecfff, sun: 0xffffff, intensity: 2.5, name: 'Noon' },
  evening:{ sky: 0x2d3436, fog: 0x2d3436, sun: 0xff4757, intensity: 1.8, name: 'Evening' },
  night:  { sky: 0x050510, fog: 0x050510, sun: 0x4455ff, intensity: 0.6, name: 'Night' }
};

let currentTime = 'dawn';

export function setTimeOfDay(timeKey, sceneRef, weatherDisplay) {
  const t = TIME_PRESETS[timeKey];
  currentTime = timeKey;
  
  sceneRef.background.setHex(t.sky);
  sceneRef.fog.color.setHex(t.fog);
  sunLight.color.setHex(t.sun);
  sunLight.intensity = t.intensity;
  
  return t.name;
}

export function cycleTime(sceneRef, isRaining) {
  const times = Object.keys(TIME_PRESETS);
  const idx = times.indexOf(currentTime);
  const next = times[(idx + 1) % times.length];
  const name = setTimeOfDay(next, sceneRef, isRaining);
  return (isRaining ? '🌧 ' : '☀ ') + name;
}

export function getCurrentTime() { return currentTime; }