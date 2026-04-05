export const keys = {};
export const camState = {
  yaw: 0,
  pitch: 0.35,
  dist: 6,
  locked: true
};

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });
  
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  
  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  });
  
  document.addEventListener('pointerlockchange', () => {
    camState.locked = document.pointerLockElement !== canvas;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
      camState.yaw -= e.movementX * 0.002;
      camState.pitch = Math.max(0.1, Math.min(0.8, camState.pitch - e.movementY * 0.002));
    }
  });
  
  canvas.addEventListener('wheel', (e) => {
    camState.dist = Math.max(3, Math.min(12, camState.dist + e.deltaY * 0.01));
  });
}