import * as THREE from 'three';

const HIGHLIGHT = new THREE.Color(0x5a4020);
const CENTER = new THREE.Vector2(0, 0);

const materials = (mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material]);

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
      o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
      o.userData.baseEmissive = materials(o).map((m) => m.emissive?.clone());
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
      materials(o).forEach((m, i) => {
        const base = o.userData.baseEmissive[i];
        if (base) m.emissive.copy(on ? HIGHLIGHT : base);
      });
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
