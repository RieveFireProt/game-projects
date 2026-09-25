import * as THREE from 'three';

const HIGHLIGHT = new THREE.Color(0x5a4020);
const CENTER = new THREE.Vector2(0, 0);

// Raycasts from the crosshair and highlights whichever registered object is in view.
// A hotspot is { id, object, label, onUse }.
export function createInteraction({ camera, scene, maxDistance = 3 }) {
  const raycaster = new THREE.Raycaster();
  raycaster.far = maxDistance;
  let hovered = null;

  function register(hotspot) {
    // Own material copies so highlighting one object never lights up another.
    hotspot.object.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.userData.baseEmissive = o.material.emissive?.clone();
    });
    hotspot.object.userData.hotspot = hotspot;
  }

  function findHotspot(obj) {
    for (; obj; obj = obj.parent) if (obj.userData.hotspot) return obj.userData.hotspot;
    return null;
  }

  function setHighlight(hotspot, on) {
    hotspot?.object.traverse((o) => {
      if (!o.isMesh || !o.userData.baseEmissive) return;
      o.material.emissive.copy(on ? HIGHLIGHT : o.userData.baseEmissive);
    });
  }

  function update(enabled) {
    let next = null;
    if (enabled) {
      raycaster.setFromCamera(CENTER, camera);
      const hit = raycaster.intersectObjects(scene.children, true).find((h) => h.object.isMesh);
      next = hit ? findHotspot(hit.object) : null;
    }
    if (next !== hovered) {
      setHighlight(hovered, false);
      setHighlight(next, true);
      hovered = next;
    }
    return hovered;
  }

  return { register, update, get hovered() { return hovered; } };
}
