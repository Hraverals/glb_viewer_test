import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { initFurnitureSystem } from "./FurnitureArranger.js";

const status = document.getElementById("status");
const scene = new THREE.Scene();

const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 10, 7);
scene.add(dir);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xeeeeee, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 가구 배치 시스템 가동
initFurnitureSystem(scene, camera, renderer, controls);

// 6. 메인 모델(집) 로드 및 회전 제어 변수
let houseModel = null;
const guideText = "<b>[조작법]</b> 더블클릭: 배치 | W:이동, E:회전, R:크기 | <b>X,Y,Z: 집 회전</b>";

const loader = new GLTFLoader();
loader.load(
    "./house.glb",
    (gltf) => {
        houseModel = gltf.scene;
        
        // 초기 위치 설정 (바닥을 아래로)
        houseModel.rotation.x = -Math.PI / 2;
        
        scene.add(houseModel);
        fitCameraToObject(camera, houseModel, 1.5, controls);
        
        // 초기 가이드 표시
        status.innerHTML = guideText;
    }
);

window.addEventListener("keydown", (event) => {
    if (!houseModel) return;

    const key = event.key.toLowerCase();
    let actionMessage = "";

    switch (key) {
        case "x":
            houseModel.rotation.x += Math.PI / 2;
            actionMessage = "<span style='color: #e74c3c;'>[System] X축 90도 회전 완료</span>";
            break;
        case "y":
            houseModel.rotation.y += Math.PI / 2;
            actionMessage = "<span style='color: #2ecc71;'>[System] Y축 90도 회전 완료</span>";
            break;
        case "z":
            houseModel.rotation.z += Math.PI / 2;
            actionMessage = "<span style='color: #3498db;'>[System] Z축 90도 회전 완료</span>";
            break;
    }

    if (actionMessage) {
        status.innerHTML = `${actionMessage} <br> ${guideText}`;
        
        setTimeout(() => {
            status.innerHTML = guideText;
        }, 2000);
    }
});

function fitCameraToObject(cam, object, offset = 1.25, orbitControls) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(cam.fov);
    let cameraZ = (maxDim / 2) / Math.tan(fov / 2) * offset;

    cam.position.set(center.x, center.y + (maxDim * 0.5), center.z + cameraZ);
    cam.updateProjectionMatrix();

    if (orbitControls) {
        orbitControls.target.copy(center);
        orbitControls.update();
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});