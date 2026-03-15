import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CinematicSignboard() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      WIDTH / HEIGHT,
      0.1,
      1000
    );

    camera.position.set(0, 5, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.objectFit = "contain";

    mountRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();

    // BACKGROUND
    loader.load(
      "https://static.wixstatic.com/media/50f4bf_f00fd8f0db544aff8e225b236ad4eee1~mv2.png",
      (texture) => {
        const ratio = texture.image.width / texture.image.height;
        const height = 220;
        const width = height * ratio;

        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          new THREE.MeshBasicMaterial({ map: texture })
        );

        mesh.position.z = -100;
        scene.add(mesh);
      }
    );

    // LETREIRO
    let sign: THREE.Mesh | null = null;

    loader.load(
      "https://static.wixstatic.com/media/50f4bf_da5491b446c6486a8a26d7d3a300d4d3~mv2.png",
      (texture) => {
        const ratio = texture.image.width / texture.image.height;
        const height = 30;
        const width = height * ratio;

        sign = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
          })
        );

        sign.position.y = 6;
        scene.add(sign);
      }
    );

    // CHUVA
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = 1200;
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }

    rainGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const rain = new THREE.Points(
      rainGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.7,
      })
    );

    scene.add(rain);

    // LUZ POLICIAL
    const redLight = new THREE.PointLight(0xff0000, 3, 200);
    redLight.position.set(-30, 5, 10);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x0066ff, 3, 200);
    blueLight.position.set(30, 5, 10);
    scene.add(blueLight);

    // ANIMAÇÃO
    const start = Date.now();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 6000, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.z = 120 - ease * 80;

      if (sign) {
        sign.rotation.y = Math.sin(elapsed * 0.001) * 0.05;
      }

      // CHUVA
      const arr = rain.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < rainCount; i++) {
        arr[i * 3 + 1] -= 1;

        if (arr[i * 3 + 1] < -60) {
          arr[i * 3 + 1] = 150;
        }
      }

      rain.geometry.attributes.position.needsUpdate = true;

      // LUZ POLÍCIA
      redLight.intensity = 2 + Math.sin(elapsed * 0.01) * 2;
      blueLight.intensity = 2 + Math.cos(elapsed * 0.01) * 2;

      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}
