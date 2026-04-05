import * as THREE from 'three';

export const TRACKS = [
  { name: "Midnight Jazz", duration: 180, genre: "Jazz" },
  { name: "Rainy Lofi", duration: 240, genre: "Lofi" },
  { name: "Urban Echoes", duration: 200, genre: "Ambient" },
  { name: "Street Symphony", duration: 160, genre: "Classical" }
];

export function createMusicTexture(track) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Vinyl grooves
  ctx.strokeStyle = '#333';
  for (let r = 30; r < 100; r += 10) {
    ctx.beginPath();
    ctx.arc(c.width/2, c.height/2, r, 0, Math.PI*2);
    ctx.stroke();
  }
  
  // Center label
  ctx.fillStyle = '#e8c547';
  ctx.beginPath();
  ctx.arc(c.width/2, c.height/2, 25, 0, Math.PI*2);
  ctx.fill();
  
  // Note icon
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 30px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♪', c.width/2, c.height/2);
  
  // Track name
  ctx.fillStyle = '#fff';
  ctx.font = '11px monospace';
  ctx.fillText(track.name, c.width/2, c.height - 35);
  ctx.fillText(track.genre, c.width/2, c.height - 20);
  
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}