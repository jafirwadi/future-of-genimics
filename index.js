import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ── Scene Setup ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.018);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 2, 18);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

// ── Post-Processing ──
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.4, 0.6, 0.15
);
composer.addPass(bloomPass);

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(fxaaPass);
composer.addPass(new OutputPass());

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0x112233, 0.6);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
mainLight.name = 'mainDirectionalLight';
mainLight.position.set(5, 10, 8);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(1024, 1024);
scene.add(mainLight);

const backLight = new THREE.DirectionalLight(0x00bcd4, 0.8);
backLight.name = 'backLight';
backLight.position.set(-5, -3, -8);
scene.add(backLight);

const pointLight1 = new THREE.PointLight(0x00e5ff, 3, 30);
pointLight1.name = 'pointLightCyan1';
pointLight1.position.set(4, 5, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00bfa5, 2, 25);
pointLight2.name = 'pointLightTeal';
pointLight2.position.set(-5, -2, 6);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x18ffff, 1.5, 20);
pointLight3.name = 'pointLightAccent';
pointLight3.position.set(0, 0, 10);
scene.add(pointLight3);

// ── DNA Double Helix ──
const dnaGroup = new THREE.Group();
dnaGroup.name = 'dnaHelixGroup';
scene.add(dnaGroup);

const helixParams = {
  radius: 1.8,
  height: 22,
  turns: 4.5,
  segments: 320,
  sphereRadius: 0.14,
  rungSpacing: 8
};

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00e5ff,
  transparent: true,
  opacity: 0.35,
  roughness: 0.05,
  metalness: 0.1,
  transmission: 0.9,
  thickness: 0.5,
  ior: 1.5,
  envMapIntensity: 1.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  emissive: 0x003344,
  emissiveIntensity: 0.3,
  side: THREE.DoubleSide
});

const glowMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00ffcc,
  transparent: true,
  opacity: 0.7,
  roughness: 0.1,
  metalness: 0.0,
  emissive: 0x00e5ff,
  emissiveIntensity: 1.5
});

const rungMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00bcd4,
  transparent: true,
  opacity: 0.25,
  roughness: 0.1,
  metalness: 0.0,
  transmission: 0.85,
  thickness: 0.2,
  emissive: 0x004455,
  emissiveIntensity: 0.5
});

const sphereGeo = new THREE.SphereGeometry(helixParams.sphereRadius, 12, 8);
const rungGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6);

// Build helix strands using InstancedMesh
const instanceCount = helixParams.segments;
const strand1 = new THREE.InstancedMesh(sphereGeo, glassMaterial, instanceCount);
strand1.name = 'dnaStrand1';
const strand2 = new THREE.InstancedMesh(sphereGeo, glassMaterial, instanceCount);
strand2.name = 'dnaStrand2';

const glowSphereGeo = new THREE.SphereGeometry(helixParams.sphereRadius * 1.6, 8, 6);
const glow1 = new THREE.InstancedMesh(glowSphereGeo, glowMaterial, instanceCount);
glow1.name = 'dnaGlow1';
const glow2 = new THREE.InstancedMesh(glowSphereGeo, glowMaterial, instanceCount);
glow2.name = 'dnaGlow2';

const dummy = new THREE.Object3D();
const strand1Positions = [];
const strand2Positions = [];

for (let i = 0; i < instanceCount; i++) {
  const t = i / instanceCount;
  const angle = t * Math.PI * 2 * helixParams.turns;
  const y = (t - 0.5) * helixParams.height;

  const x1 = Math.cos(angle) * helixParams.radius;
  const z1 = Math.sin(angle) * helixParams.radius;
  const x2 = Math.cos(angle + Math.PI) * helixParams.radius;
  const z2 = Math.sin(angle + Math.PI) * helixParams.radius;

  strand1Positions.push(new THREE.Vector3(x1, y, z1));
  strand2Positions.push(new THREE.Vector3(x2, y, z2));

  dummy.position.set(x1, y, z1);
  dummy.updateMatrix();
  strand1.setMatrixAt(i, dummy.matrix);
  glow1.setMatrixAt(i, dummy.matrix);

  dummy.position.set(x2, y, z2);
  dummy.updateMatrix();
  strand2.setMatrixAt(i, dummy.matrix);
  glow2.setMatrixAt(i, dummy.matrix);
}

dnaGroup.add(strand1, strand2, glow1, glow2);

// Rungs (connecting bars)
const rungCount = Math.floor(instanceCount / helixParams.rungSpacing);
const rungs = new THREE.InstancedMesh(rungGeo, rungMaterial, rungCount);
rungs.name = 'dnaRungs';

for (let i = 0; i < rungCount; i++) {
  const idx = i * helixParams.rungSpacing;
  if (idx >= instanceCount) break;

  const p1 = strand1Positions[idx];
  const p2 = strand2Positions[idx];
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const dist = p1.distanceTo(p2);

  dummy.position.copy(mid);
  dummy.scale.set(1, dist, 1);
  const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
  dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  dummy.updateMatrix();
  rungs.setMatrixAt(i, dummy.matrix);
}
dnaGroup.add(rungs);

// Backbone tubes
function createHelixTube(positions, name) {
  const curve = new THREE.CatmullRomCurve3(positions);
  const tubeGeo = new THREE.TubeGeometry(curve, positions.length, 0.04, 6, false);
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.92,
    thickness: 0.3,
    emissive: 0x004466,
    emissiveIntensity: 0.4
  });
  const mesh = new THREE.Mesh(tubeGeo, tubeMat);
  mesh.name = name;
  return mesh;
}

dnaGroup.add(createHelixTube(strand1Positions, 'helixTube1'));
dnaGroup.add(createHelixTube(strand2Positions, 'helixTube2'));

// ── Bioluminescent Particles ──
const particleCount = 3000;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleSpeeds = new Float32Array(particleCount);
const particlePhases = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 40;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 28;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  particleSizes[i] = Math.random() * 3 + 0.5;
  particleSpeeds[i] = Math.random() * 0.5 + 0.2;
  particlePhases[i] = Math.random() * Math.PI * 2;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleVertShader = `
  attribute float size;
  varying float vAlpha;
  uniform float uTime;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPos.z);
    vAlpha = 0.4 + 0.6 * sin(uTime * 1.5 + position.x * 0.5 + position.y * 0.3);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const particleFragShader = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    glow = pow(glow, 2.0);
    vec3 col = mix(vec3(0.0, 0.9, 1.0), vec3(0.0, 1.0, 0.8), glow);
    gl_FragColor = vec4(col, glow * vAlpha * 0.6);
  }
`;

const particleMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: particleVertShader,
  fragmentShader: particleFragShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeo, particleMat);
particles.name = 'bioluminescentParticles';
scene.add(particles);

// ── Teal Light Trails (horizontal flowing) ──
const trailCount = 6;
const trailGroup = new THREE.Group();
trailGroup.name = 'lightTrailsGroup';
scene.add(trailGroup);

const trails = [];
for (let i = 0; i < trailCount; i++) {
  const y = (i - trailCount / 2) * 1.8 + (Math.random() - 0.5) * 2;
  const z = -5 + Math.random() * 4;
  const points = [];
  const segCount = 120;
  for (let j = 0; j < segCount; j++) {
    const t = j / segCount;
    const x = (t - 0.5) * 50;
    points.push(new THREE.Vector3(x, y + Math.sin(t * Math.PI * 3 + i) * 0.8, z));
  }
  const curve = new THREE.CatmullRomCurve3(points);

  const trailVertShader = `
    uniform float uTime;
    uniform float uOffset;
    attribute float lineDistance;
    varying float vT;
    varying float vAlpha;
    void main() {
      vT = lineDistance;
      float wave = sin(vT * 6.2832 * 2.0 - uTime * 1.5 + uOffset) * 0.5 + 0.5;
      vAlpha = wave * wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const trailFragShader = `
    varying float vT;
    varying float vAlpha;
    void main() {
      vec3 col = mix(vec3(0.0, 0.72, 0.66), vec3(0.0, 0.9, 1.0), vAlpha);
      float edge = smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
      gl_FragColor = vec4(col, vAlpha * edge * 0.35);
    }
  `;

  const trailMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOffset: { value: i * 1.3 }
    },
    vertexShader: trailVertShader,
    fragmentShader: trailFragShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const tubeGeo = new THREE.TubeGeometry(curve, segCount, 0.02 + Math.random() * 0.02, 4, false);
  // Compute lineDistance attribute for the tube
  const posArr = tubeGeo.attributes.position;
  const lineDistances = new Float32Array(posArr.count);
  for (let j = 0; j < posArr.count; j++) {
    const x = posArr.getX(j);
    lineDistances[j] = (x + 25) / 50;
  }
  tubeGeo.setAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1));

  const trailMesh = new THREE.Mesh(tubeGeo, trailMat);
  trailMesh.name = `lightTrail_${i}`;
  trailGroup.add(trailMesh);
  trails.push(trailMat);
}

// ── Floating ambient particles (very subtle, background depth) ──
const bgParticleCount = 500;
const bgGeo = new THREE.BufferGeometry();
const bgPos = new Float32Array(bgParticleCount * 3);
const bgSizes = new Float32Array(bgParticleCount);
for (let i = 0; i < bgParticleCount; i++) {
  bgPos[i * 3] = (Math.random() - 0.5) * 60;
  bgPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
  bgPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
  bgSizes[i] = Math.random() * 1.5 + 0.3;
}
bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
bgGeo.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

const bgParticleMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    attribute float size;
    varying float vA;
    uniform float uTime;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (100.0 / -mv.z);
      vA = 0.3 + 0.3 * sin(uTime * 0.8 + position.z * 0.2);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    varying float vA;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if(d > 0.5) discard;
      float g = 1.0 - smoothstep(0.0, 0.5, d);
      gl_FragColor = vec4(0.0, 0.7, 0.75, pow(g, 3.0) * vA * 0.3);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const bgParticles = new THREE.Points(bgGeo, bgParticleMat);
bgParticles.name = 'backgroundParticles';
scene.add(bgParticles);

// ── Vignette Background Gradient ──
const vignetteGeo = new THREE.PlaneGeometry(100, 100);
const vignetteMat = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    varying vec2 vUv;
    void main(){
      vec2 c = vUv - 0.5;
      float d = length(c);
      float vig = smoothstep(0.2, 0.75, d);
      vec3 col = mix(vec3(0.04, 0.04, 0.06), vec3(0.01, 0.01, 0.015), vig);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  depthWrite: false,
  side: THREE.DoubleSide
});
const vignette = new THREE.Mesh(vignetteGeo, vignetteMat);
vignette.name = 'vignetteBackground';
vignette.position.z = -30;
scene.add(vignette);

// ── Controls ──
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = false;
controls.minPolarAngle = Math.PI * 0.35;
controls.maxPolarAngle = Math.PI * 0.65;
controls.minAzimuthAngle = -Math.PI * 0.15;
controls.maxAzimuthAngle = Math.PI * 0.15;

// ── Mouse Parallax ──
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Animation Loop ──
const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();

  // DNA rotation
  dnaGroup.rotation.y = elapsed * 0.15;
  dnaGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

  // Particle animation
  particleMat.uniforms.uTime.value = elapsed;
  bgParticleMat.uniforms.uTime.value = elapsed;

  const posAttr = particleGeo.attributes.position;
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    particlePositions[idx + 1] += Math.sin(elapsed * particleSpeeds[i] + particlePhases[i]) * 0.002;
    // Gentle horizontal drift
    particlePositions[idx] += Math.cos(elapsed * 0.3 + particlePhases[i]) * 0.001;
  }
  posAttr.needsUpdate = true;

  // Trail animation
  trails.forEach(mat => {
    mat.uniforms.uTime.value = elapsed;
  });

  // Camera parallax
  camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.8 + 2 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  // Pulsing lights
  pointLight1.intensity = 3 + Math.sin(elapsed * 2) * 0.8;
  pointLight3.intensity = 1.5 + Math.sin(elapsed * 1.5 + 1) * 0.5;

  controls.update();
  composer.render();
}

renderer.setAnimationLoop(animate);

// ── Handle Resize ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
});

// ── HTML UI Overlay ──
const uiContainer = document.createElement('div');
uiContainer.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .nav-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 48px);
    max-width: 1200px;
    height: 56px;
    background: rgba(10, 10, 18, 0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(0, 229, 255, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    z-index: 100;
    font-family: 'Inter', sans-serif;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 16px;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .nav-logo-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, #00e5ff 0%, #00bfa5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #0a0a0f;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }

  .nav-links a {
    text-decoration: none;
    color: rgba(255, 255, 255, 0.55);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: color 0.3s;
    cursor: pointer;
  }

  .nav-links a:hover {
    color: #00e5ff;
  }

  .nav-cta {
    padding: 8px 20px;
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.25);
    border-radius: 10px;
    color: #00e5ff;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 0.01em;
  }

  .nav-cta:hover {
    background: rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 229, 255, 0.4);
  }

  .hero-content {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 48px 64px;
    z-index: 50;
    font-family: 'Inter', sans-serif;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: linear-gradient(
    to top,
    rgba(3, 3, 10, 0.92) 0%,
    rgba(3, 3, 10, 0.6) 50%,
    transparent 100%
    );
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(0, 229, 255, 0.06);
    border: 1px solid rgba(0, 229, 255, 0.15);
    border-radius: 100px;
    color: #00e5ff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .hero-tag-dot {
    width: 6px;
    height: 6px;
    background: #00e5ff;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .hero-heading {
    font-size: clamp(42px, 7vw, 88px);
    font-weight: 800;
    color: #ffffff;
    line-height: 0.95;
    letter-spacing: -0.04em;
    margin-bottom: 20px;
  }

  .hero-heading span {
    background: linear-gradient(135deg, #00e5ff 0%, #00bfa5 50%, #18ffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: clamp(14px, 1.6vw, 18px);
    color: rgba(255, 255, 255, 0.45);
    font-weight: 400;
    max-width: 520px;
    line-height: 1.6;
    margin-bottom: 36px;
    letter-spacing: 0.005em;
  }

  .hero-buttons {
    display: flex;
    gap: 14px;
    pointer-events: auto;
  }

  .btn-primary {
    padding: 14px 32px;
    background: #00e5ff;
    color: #0a0a0f;
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: -0.01em;
  }

  .btn-primary:hover {
    background: #18ffff;
    transform: translateY(-1px);
  }

  .btn-secondary {
    padding: 14px 32px;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: -0.01em;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .corner-info {
    position: fixed;
    bottom: 28px;
    right: 36px;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    z-index: 50;
  }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hero-content { padding: 0 24px 48px; }
    .nav-bar { width: calc(100% - 24px); padding: 0 16px; }
    .hero-buttons { flex-direction: column; width: 100%; max-width: 280px; }
    .btn-primary, .btn-secondary { width: 100%; text-align: center; }
    .corner-info { display: none; }
  }
</style>

<nav class="nav-bar">
  <div class="nav-logo">
    <div class="nav-logo-icon">G</div>
    GenomX
  </div>
  <ul class="nav-links">
    <a href="#">Platform</a>
    <a href="#">Research</a>
    <a href="#">Solutions</a>
    <a href="#">About</a>
  </ul>
  <button class="nav-cta">Get Access</button>
</nav>

<div class="hero-content">
  <div class="hero-tag">
    <div class="hero-tag-dot"></div>
    Next-Gen Sequencing
  </div>
  <h1 class="hero-heading">Future of<br><span>Genomics</span></h1>
  <p class="hero-sub">Pioneering precision medicine through advanced genomic analysis, AI-driven sequencing, and molecular intelligence.</p>
  <div class="hero-buttons">
    <button class="btn-primary">Explore Platform</button>
    <button class="btn-secondary">Watch Demo</button>
  </div>
</div>

<div class="corner-info">GenomX © 2025</div>
`;
document.body.appendChild(uiContainer);