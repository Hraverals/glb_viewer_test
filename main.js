import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const status = document.getElementById("status");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,                                     // 시야각
  window.innerWidth / window.innerHeight, // 종횡비
  0.1,                                    // 가까운 절단면
  1000                                    // 먼 절단면
);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias 없으니까 내 gpu가 힘들어함
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 제어 기능
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const loader = new GLTFLoader();
loader.load(
  "./house.glb",
  // 로드 완료 시 호출
  function (gltf) {
    scene.add(gltf.scene);
    fitCameraToObject(camera, gltf.scene, 1.2, controls);
    status.textContent = "로딩 완료";
  },
  // 로딩 중 호출
  function (xhr) {
    if (xhr.total) {
      const percent = ((xhr.loaded / xhr.total) * 100).toFixed(1);
      status.textContent = `${percent}% 로드됨`;
    } else {
      status.textContent = "로딩 중…";
    }
  },
  // 오류 발생 시 호출
  function (error) {
    console.error("오류 발생", error);
    status.textContent = "오류 발생 (콘솔 확인)";
  }
);

function fitCameraToObject(cam, object, offset = 1.25, orbitControls) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z); // 자꾸 레이아웃 오류나서 AI가 집어넣으라는데 어떤 식으로 작동하는지 잘 모르겠음
  const fov = THREE.MathUtils.degToRad(cam.fov);
  let cameraZ = (maxDim / 2) / Math.tan(fov / 2);
  cameraZ *= offset;
  // let offsetX = 0, offsetY = 0, offsetZ = 0;
  // camera.position.set(center.x + offsetX, center.y + offsetY, center.z + offsetZ);
  // 오프셋이 왜 들어가야하는지 이해가 잘 안됨
  cam.position.set(center.x, center.y, center.z + cameraZ);
  // cam.near = size / 100;
  // cam.far = size * 100;
  // maxDim 사용으로 인한 변수 참조 변경
  cam.near = maxDim / 100;
  cam.far = maxDim * 100;

  cam.updateProjectionMatrix();

  if (orbitControls) {
    orbitControls.target.copy(center);
    orbitControls.update();
  } else {
    cam.lookAt(center);
  }
}

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();