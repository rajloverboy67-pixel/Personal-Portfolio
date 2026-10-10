import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

function bulgePlane(w, h, segX, segY, bulge) {
  const geo = new THREE.PlaneGeometry(w, h, segX, segY);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const nx = x / (w * 0.5);
    const ny = y / (h * 0.5);
    pos.setZ(i, bulge * (1 - (nx * nx + ny * ny) * 0.92));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createCrtScene(host, phosphor) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: host,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x070500, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0800);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

  const texture = new THREE.CanvasTexture(phosphor.canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const tv = new THREE.Group();
  tv.scale.setScalar(1.12);
  scene.add(tv);

  const beige = new THREE.MeshStandardMaterial({ color: 0xd6cbb8, roughness: 0.58, metalness: 0.06 });
  const beigeDark = new THREE.MeshStandardMaterial({ color: 0xb9ad97, roughness: 0.62, metalness: 0.05 });
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x1c1915, roughness: 0.74, metalness: 0.18 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd5dbe0, roughness: 0.16, metalness: 0.9 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0d0c0a, roughness: 0.38, metalness: 0.12 });
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x2d291f, roughness: 0.32, metalness: 0.28 });

  const body = new THREE.Mesh(new RoundedBoxGeometry(4.35, 3.25, 3.15, 5, 0.13), beige);
  tv.add(body);

  const rear = new THREE.Mesh(new RoundedBoxGeometry(3.55, 2.55, 1.7, 3, 0.1), charcoal);
  rear.position.set(0, 0.05, -1.55);
  tv.add(rear);

  for (let i = 0; i < 5; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.045, 0.32), new THREE.MeshStandardMaterial({ color: 0x11100e }));
    vent.position.set(0, 0.55 - i * 0.22, -2.38);
    tv.add(vent);
  }

  const face = new THREE.Mesh(new RoundedBoxGeometry(4.15, 3.08, 0.2, 4, 0.07), beigeDark);
  face.position.z = 1.58;
  tv.add(face);

  const well = new THREE.Mesh(new THREE.BoxGeometry(3.28, 2.18, 0.14), black);
  well.position.set(0, 0.28, 1.66);
  tv.add(well);

  const screenMat = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 1.05,
    roughness: 0.28,
    metalness: 0.02
  });
  const screen = new THREE.Mesh(bulgePlane(3.18, 2.08, 36, 24, 0.22), screenMat);
  screen.position.set(0, 0.28, 1.72);
  tv.add(screen);

  const glass = new THREE.Mesh(
    bulgePlane(3.22, 2.12, 24, 16, 0.23),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.07,
      roughness: 0.05,
      metalness: 0.15
    })
  );
  glass.position.set(0, 0.28, 1.76);
  tv.add(glass);

  const speaker = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.32, 0.08), charcoal);
  speaker.position.set(-0.35, -1.18, 1.7);
  tv.add(speaker);
  for (let i = 0; i < 16; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.24, 0.04), black);
    slat.position.set(-1.4 + i * 0.145, -1.18, 1.75);
    tv.add(slat);
  }

  const channelKnob = new THREE.Group();
  const knobBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.14, 28), knobMat);
  knobBody.rotation.x = Math.PI / 2;
  channelKnob.add(knobBody);
  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), beige);
  marker.position.set(0, 0.1, 0.07);
  channelKnob.add(marker);
  channelKnob.position.set(1.72, -1.18, 1.76);
  tv.add(channelKnob);

  const volKnob = channelKnob.clone();
  volKnob.position.set(1.28, -1.18, 1.76);
  tv.add(volKnob);

  const power = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.09, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.6, roughness: 0.3 })
  );
  power.rotation.x = Math.PI / 2;
  power.position.set(-1.85, -1.18, 1.76);
  tv.add(power);

  const ledGreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.6 })
  );
  ledGreen.position.set(-1.58, -1.18, 1.76);
  tv.add(ledGreen);

  const ledRed = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a1515, emissive: 0xef4444, emissiveIntensity: 0.25 })
  );
  ledRed.position.set(-1.44, -1.18, 1.76);
  tv.add(ledRed);

  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.03), charcoal);
  badge.position.set(0, 1.38, 1.7);
  tv.add(badge);

  const base = new THREE.Mesh(new RoundedBoxGeometry(3.9, 0.24, 2.4, 2, 0.06), beigeDark);
  base.position.set(0, -1.62, 0.15);
  tv.add(base);

  function antenna(x, rotZ) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), chrome));
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012, 2.35, 8), chrome);
    rod.position.y = 1.18;
    group.add(rod);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), chrome);
    tip.position.y = 2.36;
    group.add(tip);
    group.position.set(x, 1.62, -0.55);
    group.rotation.z = rotZ;
    group.rotation.x = -0.42;
    tv.add(group);
  }
  antenna(-0.38, 0.58);
  antenna(0.38, -0.58);

  scene.add(new THREE.AmbientLight(0xffe6b0, 0.45));
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x1a1408, 0.85));
  const key = new THREE.DirectionalLight(0xffe7c2, 1.35);
  key.position.set(3.4, 5.2, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8ec9ff, 0.4);
  fill.position.set(-5, 1.4, 2);
  scene.add(fill);
  const screenGlow = new THREE.PointLight(0x7dffc0, 2.2, 10);
  screenGlow.position.set(0, 0.3, 2.4);
  tv.add(screenGlow);

  const pointer = { x: 0, y: 0 };
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  });

  function resize() {
    const w = Math.max(1, host.clientWidth || host.parentElement.clientWidth);
    const h = Math.max(1, host.clientHeight || 460);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1.1 ? 38 : 34;
    camera.position.set(0.15, 0.08, 6.35);
    camera.lookAt(0, -0.15, 0.6);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(host.parentElement || host);
  }

  let knobTarget = 0;
  function setChannel(i) {
    knobTarget = (i / 4) * Math.PI * 1.7;
  }

  function frame(t) {
    phosphor.render(t);
    texture.needsUpdate = true;
    const idleX = Math.sin(t * 0.00065) * 0.035;
    const idleY = Math.cos(t * 0.00085) * 0.04;
    tv.rotation.y += (pointer.x * 0.32 + idleY - tv.rotation.y) * 0.07;
    tv.rotation.x += (pointer.y * 0.1 + idleX - tv.rotation.x) * 0.07;
    tv.position.y = Math.sin(t * 0.00105) * 0.035;
    channelKnob.rotation.z += (knobTarget - channelKnob.rotation.z) * 0.14;
    screenGlow.intensity = 1.7 + Math.sin(t * 0.007) * 0.3;
    renderer.render(scene, camera);
  }

  return { frame, resize, setChannel, renderer };
}
