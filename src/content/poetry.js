export const POEMS = [
  { text: "The city exhales\nbefore the buses come", author: "Urban Silence" },
  { text: "Find the next track\non the next wall", author: "The Wanderer" },
  { text: "Three a.m. or six —\nthe light is the same here", author: "Insomniac" },
  { text: "Rain is just the city\nwashing its face", author: "Storm Walker" },
  { text: "Between these towers\nsomebody is awake", author: "Night Owl" },
  { text: "Footsteps echo\nwhere no one walks", author: "Ghost Streets" },
  { text: "The sun rises twice here\nonce in the sky, once in glass", author: "Reflection" },
  { text: "Every door is a question\nevery window, an answer", author: "The Philosopher" }
];

export function createPoemTexture(poem) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  
  ctx.fillStyle = '#0f0f15';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#e8c547';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, c.width-20, c.height-20);
  
  ctx.fillStyle = '#f0e6d2';
  ctx.font = 'bold 24px Courier New';
  ctx.textAlign = 'center';
  
  poem.text.split('\n').forEach((line, i) => {
    ctx.fillText(line, c.width/2, 100 + i * 35);
  });
  
  ctx.fillStyle = '#888';
  ctx.font = 'italic 14px Courier New';
  ctx.fillText(`— ${poem.author}`, c.width/2, c.height - 40);
  
  return new THREE.CanvasTexture(c);
}