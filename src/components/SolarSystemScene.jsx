"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  SOLAR_SYSTEM_BODIES,
  orbitDurationSeconds,
} from "@/lib/solar-system";
import {
  BODY_3D,
  ORBIT_SCALE,
  createCloudCanvas,
  createGlowCanvas,
  createRingCanvas,
  createSurfaceCanvas,
} from "@/lib/solar-system-3d";

const DEG = Math.PI / 180;

/** RingGeometry dengan UV radial supaya tekstur cincin memetakan dari dalam ke luar. */
function ringGeometry(inner, outer, segments = 160) {
  const geo = new THREE.RingGeometry(inner, outer, segments, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const t = (v.length() - inner) / (outer - inner);
    uv.setXY(i, THREE.MathUtils.clamp(t, 0, 1), i % 2);
  }
  uv.needsUpdate = true;
  return geo;
}

function canvasTexture(canvas, { repeatWrap = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeatWrap) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  return tex;
}

/**
 * Peta Tata Surya 3D (WebGL). Bola bertekstur prosedural, orbit miring,
 * sabuk asteroid, cincin Saturnus & Uranus, plus kontrol putar/zoom.
 *
 * Props sengaja dibaca lewat ref di dalam loop render agar perubahan
 * (jeda, label, seleksi) tidak membangun ulang seluruh scene.
 */
export default function SolarSystemScene({
  visibleKeys,
  selectedKey,
  onSelect,
  paused = false,
  showLabels = true,
  onUnsupported,
}) {
  const mountRef = useRef(null);
  const labelLayerRef = useRef(null);
  const labelRefs = useRef({});
  const syncRef = useRef(null);

  const stateRef = useRef({
    paused,
    showLabels,
    selectedKey,
    visibleKeys,
    onSelect,
    onUnsupported,
  });
  stateRef.current = {
    paused,
    showLabels,
    selectedKey,
    visibleKeys,
    onSelect,
    onUnsupported,
  };

  const setLabelRef = useCallback((key) => {
    return (el) => {
      if (el) labelRefs.current[key] = el;
      else delete labelRefs.current[key];
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      stateRef.current.onUnsupported?.();
      return undefined;
    }
    if (!renderer.getContext()) {
      stateRef.current.onUnsupported?.();
      return undefined;
    }

    const width = mount.clientWidth || 720;
    const height = mount.clientHeight || 720;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 400);
    camera.position.set(0, 14, 34);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;
    controls.maxDistance = 110;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.rotateSpeed = 0.6;
    controls.target.set(0, 0, 0);

    // ---- Cahaya -----------------------------------------------------------
    // decay 1 (bukan 2 yang fisis) supaya planet luar tidak gelap total
    const sunLight = new THREE.PointLight(0xfff0c9, 26, 0, 1);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x93a4c9, 0.18));

    /** Semua resource yang perlu dibuang saat unmount */
    const disposables = [];
    const track = (obj) => {
      disposables.push(obj);
      return obj;
    };

    // ---- Latar bintang ----------------------------------------------------
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      // Distribusi di cangkang bola agar tidak menumpuk di kutub
      const theta = Math.acos(2 * ((i * 0.618033) % 1) - 1);
      const phi = i * 2.399963;
      const r = 120 + ((i * 37) % 60);
      starPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      starPos[i * 3 + 1] = r * Math.cos(theta) * 0.6;
      starPos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = track(
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.55,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    );
    scene.add(new THREE.Points(starGeo, starMat));

    // ---- Sabuk asteroid ---------------------------------------------------
    // Harus jatuh di antara orbit Mars (9.69) dan Jupiter (12.5) pada ORBIT_SCALE
    const beltCount = 1100;
    const beltInner = 10.3;
    const beltWidth = 1.6;
    const beltPos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i += 1) {
      const angle = (i * 2.399963) % (Math.PI * 2);
      const r = beltInner + (((i * 13) % 100) / 100) * beltWidth;
      beltPos[i * 3] = Math.cos(angle) * r;
      beltPos[i * 3 + 1] = (((i * 7) % 100) / 100 - 0.5) * 0.5;
      beltPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const beltGeo = track(new THREE.BufferGeometry());
    beltGeo.setAttribute("position", new THREE.BufferAttribute(beltPos, 3));
    const beltMat = track(
      new THREE.PointsMaterial({
        color: 0xb9b3a8,
        size: 0.12,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    const belt = new THREE.Points(beltGeo, beltMat);
    scene.add(belt);

    function createTexture(canvas, opts) {
      const tex = canvasTexture(canvas, opts);
      disposables.push(tex);
      return tex;
    }

    // ---- Benda langit -----------------------------------------------------
    /** @type {Array<{key:string, mesh:THREE.Mesh, pivot:THREE.Object3D, group:THREE.Group, cfg:object, body:object, spinObjects:THREE.Object3D[], duration:number, startAngle:number}>} */
    const items = [];
    const pickables = [];
    const sphereGeo = track(new THREE.SphereGeometry(1, 64, 48));

    SOLAR_SYSTEM_BODIES.forEach((body) => {
      const cfg = BODY_3D[body.key];
      if (!cfg) return;

      const group = new THREE.Group();
      group.rotation.x = (cfg.incl || 0) * DEG;
      scene.add(group);

      const pivot = new THREE.Object3D();
      group.add(pivot);

      const holder = new THREE.Object3D();
      holder.position.x = body.orbitRadius * ORBIT_SCALE;
      pivot.add(holder);

      const surface = createTexture(createSurfaceCanvas(body.key, cfg));
      const isSun = body.key === "sun";
      const material = track(
        isSun
          ? new THREE.MeshBasicMaterial({ map: surface })
          : new THREE.MeshStandardMaterial({
              map: surface,
              roughness: cfg.texture === "banded" ? 0.95 : 0.85,
              metalness: 0.02,
            })
      );

      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.scale.setScalar(cfg.radius);
      mesh.rotation.z = (cfg.tilt || 0) * DEG;
      mesh.userData.key = body.key;
      holder.add(mesh);
      pickables.push(mesh);

      const spinObjects = [mesh];

      // Garis orbit
      if (body.orbitRadius > 0) {
        const r = body.orbitRadius * ORBIT_SCALE;
        const pts = [];
        for (let i = 0; i <= 256; i += 1) {
          const a = (i / 256) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
        }
        const lineGeo = track(new THREE.BufferGeometry().setFromPoints(pts));
        const lineMat = track(
          new THREE.LineBasicMaterial({
            color: body.type === "dwarf" ? 0x8b93a8 : 0xffffff,
            transparent: true,
            opacity: body.type === "dwarf" ? 0.16 : 0.22,
          })
        );
        group.add(new THREE.LineLoop(lineGeo, lineMat));
      }

      // Korona Matahari
      if (isSun) {
        const glowTex = createTexture(
          createGlowCanvas([
            [0, "rgba(255,238,180,0.95)"],
            [0.3, "rgba(255,175,60,0.45)"],
            [1, "rgba(255,120,20,0)"],
          ])
        );
        const glowMat = track(
          new THREE.SpriteMaterial({
            map: glowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        const glow = new THREE.Sprite(glowMat);
        glow.scale.setScalar(cfg.radius * 6);
        holder.add(glow);
      }

      // Cincin
      if (cfg.rings) {
        const ringTex = createTexture(
          createRingCanvas(cfg.rings.color, cfg.rings.faint),
          { repeatWrap: false }
        );
        const ringMat = track(
          new THREE.MeshBasicMaterial({
            map: ringTex,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            opacity: cfg.rings.faint ? 0.55 : 0.95,
          })
        );
        const ring = new THREE.Mesh(
          track(ringGeometry(cfg.rings.inner, cfg.rings.outer)),
          ringMat
        );
        ring.rotation.x = Math.PI / 2;
        const ringTilt = new THREE.Object3D();
        ringTilt.rotation.z = (cfg.tilt || 0) * DEG;
        ringTilt.add(ring);
        holder.add(ringTilt);
      }

      // Awan (Bumi)
      if (cfg.clouds) {
        const cloudTex = createTexture(createCloudCanvas(body.key));
        const cloudMat = track(
          new THREE.MeshStandardMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.45,
            depthWrite: false,
            roughness: 1,
          })
        );
        const clouds = new THREE.Mesh(sphereGeo, cloudMat);
        clouds.scale.setScalar(cfg.radius * 1.02);
        clouds.rotation.z = (cfg.tilt || 0) * DEG;
        holder.add(clouds);
        spinObjects.push(clouds);
      }

      // Bulan
      let moonPivot = null;
      if (cfg.moon) {
        moonPivot = new THREE.Object3D();
        holder.add(moonPivot);
        const moonTex = createTexture(
          createSurfaceCanvas(`${body.key}-moon`, {
            texture: cfg.moon.texture,
            palette: ["#9ca3af", "#d4d4d8", "#6b7280"],
          })
        );
        const moonMat = track(
          new THREE.MeshStandardMaterial({
            map: moonTex,
            roughness: 1,
            metalness: 0,
          })
        );
        const moon = new THREE.Mesh(sphereGeo, moonMat);
        moon.scale.setScalar(cfg.moon.radius);
        moon.position.x = cfg.moon.distance;
        moonPivot.add(moon);
      }

      items.push({
        key: body.key,
        body,
        cfg,
        group,
        pivot,
        holder,
        mesh,
        moonPivot,
        spinObjects,
        duration: orbitDurationSeconds(body.periodDays),
        startAngle: body.order * 32 * DEG,
      });
    });

    // ---- Interaksi --------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let dragging = false;
    let hoverKey = null;
    let follow = true;

    function updatePointer(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function pick() {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        pickables.filter((m) => m.userData.pickable !== false),
        false
      );
      return hits[0]?.object?.userData?.key || null;
    }

    function onPointerDown(event) {
      downX = event.clientX;
      downY = event.clientY;
      dragging = false;
    }

    function onPointerMove(event) {
      if (event.buttons > 0) {
        if (
          Math.abs(event.clientX - downX) > 4 ||
          Math.abs(event.clientY - downY) > 4
        ) {
          dragging = true;
        }
        return;
      }
      updatePointer(event);
      const key = pick();
      if (key !== hoverKey) {
        hoverKey = key;
        renderer.domElement.style.cursor = key ? "pointer" : "grab";
      }
    }

    function onPointerUp(event) {
      if (dragging) return;
      updatePointer(event);
      const key = pick();
      if (key) {
        follow = true;
        stateRef.current.onSelect?.(key);
      }
    }

    function onPointerLeave() {
      hoverKey = null;
      renderer.domElement.style.cursor = "grab";
    }

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    // Geser kamera manual = berhenti mengikuti planet terpilih
    controls.addEventListener("start", () => {
      follow = false;
    });

    // ---- Loop -------------------------------------------------------------
    const clock = new THREE.Clock();
    let elapsed = 0;
    let frame = 0;
    let lastActiveKey = null;
    const worldPos = new THREE.Vector3();
    const projected = new THREE.Vector3();
    const focusTarget = new THREE.Vector3();

    function syncVisibility() {
      const keys = stateRef.current.visibleKeys;
      items.forEach((item) => {
        const visible = !keys || keys.includes(item.key);
        item.group.visible = visible;
        item.mesh.userData.pickable = visible;
        const label = labelRefs.current[item.key];
        if (label && !visible) label.style.opacity = "0";
      });
    }

    function render() {
      frame = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.1);
      const { paused: isPaused, showLabels: labelsOn, selectedKey: activeKey } =
        stateRef.current;

      // Seleksi baru (dari klik maupun dari panel samping) mengaktifkan lagi
      // mode ikuti, yang dimatikan begitu pengguna menggeser kamera sendiri.
      if (activeKey !== lastActiveKey) {
        lastActiveKey = activeKey;
        follow = true;
      }

      if (!isPaused) elapsed += delta;

      items.forEach((item) => {
        if (item.duration > 0) {
          item.pivot.rotation.y =
            -item.startAngle - (elapsed / item.duration) * Math.PI * 2;
        }
        const spin = item.cfg.spin || 0;
        if (spin !== 0) {
          const angle = (elapsed / Math.abs(spin)) * Math.PI * 2;
          item.spinObjects.forEach((obj, i) => {
            // Awan berputar sedikit lebih cepat dari permukaan
            obj.rotation.y = Math.sign(spin) * angle * (i === 0 ? 1 : 1.15);
          });
        }
        if (item.moonPivot) {
          item.moonPivot.rotation.y = -(elapsed / 6) * Math.PI * 2;
        }
      });

      if (!isPaused) belt.rotation.y -= delta * 0.02;

      // Kamera mengikuti objek terpilih (tanpa penanda visual)
      const active = items.find((i) => i.key === activeKey && i.group.visible);
      if (active && follow) {
        active.mesh.getWorldPosition(worldPos);
        focusTarget.copy(worldPos);
        controls.target.lerp(focusTarget, 0.06);
      }

      controls.update();
      renderer.render(scene, camera);

      // Label HTML diproyeksikan dari posisi 3D
      const layer = labelLayerRef.current;
      if (layer) {
        const w = layer.clientWidth;
        const h = layer.clientHeight;
        items.forEach((item) => {
          const el = labelRefs.current[item.key];
          if (!el) return;
          if (!labelsOn || !item.group.visible) {
            el.style.opacity = "0";
            return;
          }
          item.mesh.getWorldPosition(projected);
          projected.project(camera);
          if (projected.z > 1) {
            el.style.opacity = "0";
            return;
          }
          const x = (projected.x * 0.5 + 0.5) * w;
          const y = (-projected.y * 0.5 + 0.5) * h;
          el.style.transform = `translate(-50%, 0) translate(${x}px, ${y}px)`;
          el.style.opacity = item.key === activeKey ? "1" : "0.75";
        });
      }
    }

    syncVisibility();
    frame = requestAnimationFrame(render);

    // ---- Resize -----------------------------------------------------------
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    // Simpan handler agar effect lain bisa memicu sinkronisasi visibilitas
    syncRef.current = syncVisibility;

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      syncRef.current = null;
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // Scene dibangun sekali; perubahan props dibaca lewat stateRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pluto di-toggle tanpa membangun ulang scene
  useEffect(() => {
    syncRef.current?.();
  }, [visibleKeys]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label="Peta tata surya 3D — gunakan daftar planet di panel samping untuk memilih objek"
      />
      <div
        ref={labelLayerRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {SOLAR_SYSTEM_BODIES.filter((b) => BODY_3D[b.key]).map((b) => (
          <span
            key={b.key}
            ref={setLabelRef(b.key)}
            className="absolute left-0 top-0 -mt-1 whitespace-nowrap rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity"
            style={{ willChange: "transform" }}
          >
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
