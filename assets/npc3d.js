// NPC — an original grey clay placeholder character. Built from primitives; no textures.
import * as THREE from './three.module.min.js';

export function createNPC(canvas, { dpr = 1.5, frame = 'full', bg = null } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(dpr, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); if (bg != null) scene.background = new THREE.Color(bg);
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xdfe6f0, 0x2a2a2e, .7));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 1; key.shadow.camera.far = 30; key.shadow.camera.left = key.shadow.camera.bottom = -5; key.shadow.camera.right = key.shadow.camera.top = 5; key.shadow.bias = -.0005; scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd0ff, .7); fill.position.set(-5, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-2, 4, -6); scene.add(rim);

  const clay = new THREE.MeshStandardMaterial({ color: 0xa3a3a3, roughness: .88, metalness: 0 });
  const clayD = new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: .9, metalness: 0 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .5 });
  const root = new THREE.Group(); scene.add(root);
  const M = (g, m = clay) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; return x; };

  // ground shadow catcher
  const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 48), new THREE.ShadowMaterial({ opacity: .28 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -2.62; ground.receiveShadow = true; scene.add(ground);

  // body
  const hips = new THREE.Group(); root.add(hips);
  const torso = M(new THREE.CapsuleGeometry(.72, 1.0, 8, 24)); torso.position.y = -.2; hips.add(torso);
  const belly = M(new THREE.SphereGeometry(.78, 24, 20)); belly.scale.set(1, .8, .95); belly.position.set(0, -.55, .05); hips.add(belly);
  const neck = M(new THREE.CylinderGeometry(.22, .26, .3, 16), clayD); neck.position.y = .62; hips.add(neck);
  // head
  const head = new THREE.Group(); head.position.y = 1.62; hips.add(head);
  const skull = M(new THREE.SphereGeometry(1, 32, 28)); skull.scale.set(.96, 1, .98); head.add(skull);
  const jaw = M(new THREE.SphereGeometry(.7, 24, 20)); jaw.scale.set(1.05, .75, .95); jaw.position.set(0, -.5, .08); head.add(jaw);
  const earL = M(new THREE.SphereGeometry(.17, 12, 10), clayD); earL.position.set(-.95, -.05, 0); head.add(earL);
  const earR = earL.clone(); earR.position.x = .95; head.add(earR);
  const nose = M(new THREE.SphereGeometry(.12, 12, 10), clayD); nose.position.set(0, -.22, .96); head.add(nose);
  const eyeL = M(new THREE.SphereGeometry(.085, 12, 10), ink); eyeL.position.set(-.32, .1, .9); eyeL.castShadow = false; head.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = .32; head.add(eyeR);
  const mouth = M(new THREE.BoxGeometry(.3, .035, .05), ink); mouth.position.set(0, -.46, .9); mouth.castShadow = false; head.add(mouth);
  // limbs
  function limb(len, r) { const g = new THREE.Group(); const m = M(new THREE.CapsuleGeometry(r, len, 6, 16)); m.position.y = -len / 2 - r; g.add(m); const hand = M(new THREE.SphereGeometry(r * 1.15, 14, 12)); hand.position.y = -len - r * 1.6; g.add(hand); return g; }
  const armL = limb(1.05, .2); armL.position.set(-.86, .42, 0); hips.add(armL);
  const armR = limb(1.05, .2); armR.position.set(.86, .42, 0); hips.add(armR);
  const legL = limb(1.0, .24); legL.position.set(-.36, -1.05, 0); hips.add(legL);
  const legR = limb(1.0, .24); legR.position.set(.36, -1.05, 0); hips.add(legR);
  const footL = M(new THREE.SphereGeometry(.3, 14, 12), clayD); footL.scale.set(1, .55, 1.5); footL.position.set(-.36, -2.5, .12); hips.add(footL);
  const footR = footL.clone(); footR.position.x = .36; hips.add(footR);
  // optional prop: a small grey rectangle (phone / card)
  const prop = M(new THREE.BoxGeometry(.34, .6, .05), clayD); prop.visible = false; armR.add(prop); prop.position.set(0, -1.45, .3); prop.rotation.x = .3;

  const H = Math.PI / 2;
  const POSES = {
    idle:  { aL: [0, 0, -.14], aR: [0, 0, .14], lL: [0, 0, 0], lR: [0, 0, 0], head: [0, 0, 0], hips: [0, 0, 0], prop: false },
    tpose: { aL: [0, 0, -H], aR: [0, 0, H], lL: [0, 0, -.06], lR: [0, 0, .06], head: [0, 0, 0], hips: [0, 0, 0], prop: false },
    point: { aL: [0, 0, -.15], aR: [H, 0, .1], lL: [0, 0, 0], lR: [0, 0, 0], head: [.05, -.15, 0], hips: [0, .2, 0], prop: false },
    wave:  { aL: [0, 0, -.15], aR: [.2, 0, 2.6], lL: [0, 0, 0], lR: [0, 0, 0], head: [0, .15, -.08], hips: [0, 0, 0], prop: false },
    phone: { aL: [0, 0, -.15], aR: [2.4, 0, .5], lL: [0, 0, 0], lR: [0, 0, 0], head: [.35, 0, 0], hips: [0, 0, 0], prop: true },
    sit:   { aL: [.6, 0, -.3], aR: [.6, 0, .3], lL: [H, 0, -.05], lR: [H, 0, .05], head: [0, 0, 0], hips: [0, 0, 0], prop: false },
    shrug: { aL: [.5, 0, -1.3], aR: [.5, 0, 1.3], lL: [0, 0, 0], lR: [0, 0, 0], head: [.1, 0, .12], hips: [0, 0, 0], prop: false },
    think: { aL: [0, 0, -.15], aR: [2.7, 0, .9], lL: [0, 0, 0], lR: [0, 0, 0], head: [.15, .25, -.1], hips: [0, 0, 0], prop: false },
    arms:  { aL: [.9, 0, -.9], aR: [.9, 0, .9], lL: [0, 0, 0], lR: [0, 0, 0], head: [-.1, 0, 0], hips: [0, 0, 0], prop: false },
  };
  let cur = 'idle', target = POSES.idle, glitchT = 0, t = 0, blink = 0, nextBlink = 2, look = new THREE.Vector2(), lookT = new THREE.Vector2(), nextLook = 3, breathe = true;
  const setPose = n => { cur = n; target = POSES[n] || POSES.idle; prop.visible = !!target.prop; };
  const lerpE = (obj, arr, k) => { obj.rotation.x += (arr[0] - obj.rotation.x) * k; obj.rotation.y += (arr[1] - obj.rotation.y) * k; obj.rotation.z += (arr[2] - obj.rotation.z) * k; };
  function frameCam(f) { frame = f; if (f === 'bust') { camera.position.set(0, 1.45, 7.4); camera.lookAt(0, 1.3, 0); } else if (f === 'close') { camera.position.set(0, 1.7, 4.4); camera.lookAt(0, 1.55, 0); } else { camera.position.set(0, .1, 12.6); camera.lookAt(0, -.2, 0); } }
  function resize() { const w = canvas.clientWidth || 600, h = canvas.clientHeight || 600; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); frameCam(frame); if (frame === 'full' && camera.aspect < .9) { camera.position.z = 12.6 / Math.max(.55, camera.aspect); } }
  function glitch() { glitchT = .7; }
  function render(dt = .016) { t += dt;
    const P = glitchT > 0 ? POSES.tpose : target; if (glitchT > 0) glitchT -= dt;
    const k = glitchT > 0 ? 1 : Math.min(1, dt * 6);
    lerpE(armL, P.aL, k); lerpE(armR, P.aR, k); lerpE(legL, P.lL, k); lerpE(legR, P.lR, k); lerpE(hips, P.hips, k);
    // look + idle head motion
    nextLook -= dt; if (nextLook <= 0) { nextLook = 2.5 + Math.random() * 4; lookT.set((Math.random() - .5) * .6, (Math.random() - .5) * .3); }
    look.lerp(lookT, Math.min(1, dt * 3));
    head.rotation.x += ((P.head[0] - look.y) - head.rotation.x) * .1; head.rotation.y += ((P.head[1] + look.x) - head.rotation.y) * .1; head.rotation.z += (P.head[2] - head.rotation.z) * .1;
    if (breathe) { const b = 1 + Math.sin(t * 1.8) * .012; torso.scale.set(1, b, 1); belly.scale.set(1, .8 * b, .95); }
    nextBlink -= dt; if (nextBlink <= 0) { nextBlink = 2.5 + Math.random() * 4; blink = .13; }
    if (blink > 0) { blink -= dt; eyeL.scale.y = eyeR.scale.y = .15; } else { eyeL.scale.y = eyeR.scale.y = 1; }
    if (cur === 'sit') hips.position.y = -1.2; else hips.position.y = 0;
    renderer.render(scene, camera); }
  resize();
  return { renderer, scene, camera, root, head, setPose, frame: frameCam, render, resize, glitch, lookAt: (x, y) => { lookT.set(x, y); nextLook = 4; }, setBreathe: v => breathe = v, POSES: Object.keys(POSES) };
}
