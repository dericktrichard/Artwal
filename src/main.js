import * as THREE from 'three';
import './style.css';

// ─── Setup ────────────────────────────────────────────────
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

// ─── Lighting ─────────────────────────────────────────────
const sunLight = new THREE.DirectionalLight(0xff6b35, 1.5);
sunLight.position.set(50, 40, -50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
scene.add(ambientLight);

// ─── Ground ───────────────────────────────────────────────
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Streets
const streetMat = new THREE.MeshLambertMaterial({ 
    color: 0x2a2a2a,
    emissive: 0xe8c547,
    emissiveIntensity: 0.02
});

const street1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 400), streetMat);
street1.rotation.x = -Math.PI / 2;
street1.position.y = 0.01;
scene.add(street1);

const street2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 8), streetMat);
street2.rotation.x = -Math.PI / 2;
street2.position.y = 0.01;
scene.add(street2);

// ─── Content ──────────────────────────────────────────────
const POEMS = [
    "The city exhales\nbefore the buses come",
    "Find the next track\non the next wall",
    "Three a.m. or six —\nthe light is the same here",
    "Rain is just the city\nwashing its face",
    "Between these towers\nsomebody is awake",
    "Footsteps echo\nwhere no one walks",
    "The sun rises twice here\nonce in the sky, once in glass",
    "Every door is a question\nevery window, an answer"
];

const TRACKS = [
    { name: "Midnight Jazz", duration: 180, genre: "Jazz" },
    { name: "Rainy Lofi", duration: 240, genre: "Lofi" },
    { name: "Urban Echoes", duration: 200, genre: "Ambient" },
    { name: "Street Symphony", duration: 160, genre: "Classical" }
];

// ─── Building Generator ───────────────────────────────────
const buildings = [];
const interactables = [];

function createPoemTexture(text, author) {
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
    
    text.split('\n').forEach((line, i) => {
        ctx.fillText(line, c.width/2, 100 + i * 35);
    });
    
    ctx.fillStyle = '#888';
    ctx.font = 'italic 14px Courier New';
    ctx.fillText(`— ${author}`, c.width/2, c.height - 40);
    
    return new THREE.CanvasTexture(c);
}

function createBuilding(x, z) {
    const height = 15 + Math.random() * 25;
    const width = 10 + Math.random() * 6;
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
    const winLit = new THREE.MeshBasicMaterial({ color: 0xffeaa7 });
    const winDark = new THREE.MeshBasicMaterial({ color: 0x111111 });
    
    const cols = Math.floor(width / 2.5);
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
    
    // Content (20% chance)
    if (Math.random() < 0.2) {
        const poem = POEMS[Math.floor(Math.random() * POEMS.length)];
        const tex = createPoemTexture(poem.text, poem.author);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 2),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        plane.position.set(0, height * 0.6, depth/2 + 0.1);
        group.add(plane);
        
        group.userData.content = { type: 'poem', data: poem };
        group.userData.interactPos = new THREE.Vector3(x, height * 0.6, z + depth/2);
        interactables.push(group);
    }
    
    group.position.set(x, 0, z);
    scene.add(group);
    
    group.userData.bounds = {
        x: x, z: z,
        w: width/2 + 0.6,
        d: depth/2 + 0.6
    };
    
    buildings.push(group);
}

// Generate city
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

// ─── Street Lamps ─────────────────────────────────────────
function addStreetLamp(x, z) {
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

for (let z = -120; z <= 120; z += 25) {
    addStreetLamp(-7, z);
    addStreetLamp(7, z);
}

// ─── Character ────────────────────────────────────────────
const charGroup = new THREE.Group();

const coatMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
const darkMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
const hpMat = new THREE.MeshBasicMaterial({ color: 0xe8c547 });

// Body
const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.35), coatMat);
body.position.y = 1.1;
body.castShadow = true;
charGroup.add(body);

// Head
const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.35), skinMat);
head.position.y = 1.75;
charGroup.add(head);

// Headphones
const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.15), hpMat);
earL.position.set(-0.2, 1.75, 0);
charGroup.add(earL);
const earR = earL.clone();
earR.position.set(0.2, 1.75, 0);
charGroup.add(earR);

const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.03, 6, 12, Math.PI),
    hpMat
);
hpBand.position.y = 1.95;
hpBand.rotation.z = Math.PI / 2;
charGroup.add(hpBand);

// Legs
const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), darkMat);
legL.position.set(-0.16, 0.375, 0);
charGroup.add(legL);

const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), darkMat);
legR.position.set(0.16, 0.375, 0);
charGroup.add(legR);

// Arms
const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), coatMat);
armL.position.set(-0.42, 1.3, 0);
charGroup.add(armL);

const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), coatMat);
armR.position.set(0.42, 1.3, 0);
charGroup.add(armR);

// Umbrella
const umbrella = new THREE.Group();
const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 0.4, 8, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide })
);
canopy.position.y = 1.3;
umbrella.add(canopy);

const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8),
    new THREE.MeshBasicMaterial({ color: 0x8b4513 })
);
handle.position.y = 0.6;
umbrella.add(handle);

umbrella.position.set(0.25, 1.3, 0.3);
umbrella.rotation.z = -0.2;
umbrella.visible = false;
charGroup.add(umbrella);

scene.add(charGroup);

// ─── Rain ─────────────────────────────────────────────────
let raining = false;
const rainCount = 4000;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 100;
    rainPos[i * 3 + 1] = Math.random() * 60;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
}

rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({
    color: 0xaaccff,
    size: 0.1,
    transparent: true,
    opacity: 0.6
});
const rainSystem = new THREE.Points(rainGeo, rainMat);
rainSystem.visible = false;
scene.add(rainSystem);

// ─── Controls ─────────────────────────────────────────────
const keys = {};
const player = {
    pos: new THREE.Vector3(0, 0, 0),
    rot: 0,
    speed: 5,
    sprintSpeed: 10
};

const camState = {
    yaw: 0,
    pitch: 0.35,
    dist: 6,
    locked: true
};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        raining = !raining;
        rainSystem.visible = raining;
        umbrella.visible = raining;
        document.getElementById('weather').textContent = raining ? '🌧 Raining' : '☀ Dawn';
    }
    
    if (e.code === 'KeyT') {
        const colors = [0x1a1a2e, 0x87ceeb, 0x2d3436, 0x050510];
        const names = ['Dawn', 'Morning', 'Evening', 'Night'];
        const idx = Math.floor(Math.random() * colors.length);
        scene.background.setHex(colors[idx]);
        scene.fog.color.setHex(colors[idx]);
        document.getElementById('weather').textContent = (raining ? '🌧 ' : '☀ ') + names[idx];
    }
});

window.addEventListener('keyup', (e) => keys[e.code] = false);

canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
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

// ─── Game Loop ───────────────────────────────────────────
let walkCycle = 0;
let currentTrack = null;
let trackStart = 0;
let nearbyInteractable = null;

function update(dt) {
    // Movement
    let moveX = 0;
    let moveZ = 0;
    
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    
    const isMoving = moveX !== 0 || moveZ !== 0;
    const sprint = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = sprint ? player.sprintSpeed : player.speed;
    
    if (isMoving) {
        const len = Math.sqrt(moveX*moveX + moveZ*moveZ);
        moveX /= len;
        moveZ /= len;
        
        const forwardX = Math.sin(camState.yaw);
        const forwardZ = Math.cos(camState.yaw);
        const rightX = Math.cos(camState.yaw);
        const rightZ = -Math.sin(camState.yaw);
        
        const worldX = forwardX * -moveZ + rightX * moveX;
        const worldZ = forwardZ * -moveZ + rightZ * moveX;
        
        player.rot = Math.atan2(worldX, worldZ);
        
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
    
    // Update character
    charGroup.position.copy(player.pos);
    charGroup.rotation.y = player.rot;
    
    legL.rotation.x = Math.sin(walkCycle) * 0.5;
    legR.rotation.x = -Math.sin(walkCycle) * 0.5;
    armL.rotation.x = -Math.sin(walkCycle) * 0.3;
    
    if (umbrella.visible) {
        armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -0.4, 0.1);
        armR.rotation.z = 0.2;
    } else {
        armR.rotation.x = Math.sin(walkCycle) * 0.3;
        armR.rotation.z = 0;
    }
    
    charGroup.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.03;
    
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
    
    // Rain
    if (raining) {
        const positions = rainSystem.geometry.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
            positions[i*3+1] -= 0.6;
            if (positions[i*3+1] < 0) {
                positions[i*3+1] = 50;
                positions[i*3] = player.pos.x + (Math.random()-0.5)*80;
                positions[i*3+2] = player.pos.z + (Math.random()-0.5)*80;
            }
        }
        rainSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Interactions
    let found = false;
    for (const item of interactables) {
        if (!item.userData.interactPos) continue;
        const d = player.pos.distanceTo(item.userData.interactPos);
        if (d < 6) {
            found = true;
            if (nearbyInteractable !== item) {
                nearbyInteractable = item;
                const panel = document.getElementById('discovery');
                const content = item.userData.content;
                
                panel.classList.remove('hidden');
                panel.classList.add('visible');
                document.getElementById('type').textContent = content.type.toUpperCase();
                
                if (content.type === 'poem') {
                    document.getElementById('content').innerHTML = content.data.text.replace(/\n/g, '<br>');
                    document.getElementById('author').textContent = '— ' + content.data.author;
                }
            }
            break;
        }
    }
    
    if (!found && nearbyInteractable) {
        nearbyInteractable = null;
        document.getElementById('discovery').classList.remove('visible');
        document.getElementById('discovery').classList.add('hidden');
    }
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    update(clock.getDelta());
    renderer.render(scene, camera);
}

document.getElementById('loading').style.opacity = '0';
setTimeout(() => document.getElementById('loading').remove(), 500);

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});