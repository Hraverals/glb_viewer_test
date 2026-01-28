import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

export function initFurnitureSystem(scene, camera, renderer, controls) {
    // TransformControls 설정
    const transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    // 드래그 중에는 OrbitControls(화면 회전) 비활성화
    transformControls.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
    });

    // Raycaster 설정
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 더블 클릭 이벤트 리스너: 가구 생성
    window.addEventListener("dblclick", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            
            const isControl = selectedObject.isTransformControls || 
                              selectedObject.parent?.isTransformControls ||
                              selectedObject.type === "Line"; // 기즈모 라인 방지

            if (!isControl) {
                createFurniture(intersects[0].point, scene, transformControls);
            }
        }
    });

    window.addEventListener("keydown", (event) => {
        switch (event.key.toLowerCase()) {
            case "w": // 이동 모드
                transformControls.setMode("translate");
                break;
            case "e": // 회전 모드
                transformControls.setMode("rotate");
                break;
            case "r": // 크기 조절 모드
                transformControls.setMode("scale");
                break;
            case "escape": // 선택 해제
                transformControls.detach();
                break;
            case "delete": // 가구 삭제 (선택 사항)
            case "backspace":
                if (transformControls.object) {
                    const target = transformControls.object;
                    transformControls.detach();
                    scene.remove(target);
                }
                break;
        }
    });
}

function createFurniture(point, scene, transformControls) {
    // 빨간 박스 생성
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const furniture = new THREE.Mesh(geometry, material);

    // 좌표 설정
    furniture.position.copy(point);
    furniture.position.y += 0.25;

    scene.add(furniture);

    transformControls.attach(furniture);
}