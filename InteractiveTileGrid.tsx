import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ... existing code

// Scene setup (around line 206)
const controls = new OrbitControls(camera, renderer.domElement);

// ... existing code

// Handle resize function (before animate function definition around line 947)
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Event listener for window resize
window.addEventListener('resize', handleResize);

// ... existing code