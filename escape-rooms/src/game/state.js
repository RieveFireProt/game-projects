// All progress lives here: puzzles and the (future) AI game master read and write
// only this object. Saved to localStorage so a session can be resumed.

const SAVE_EVERY_MS = 5000;

export function createState(saveKey) {
  const fresh = () => ({ flags: {}, inventory: [], hints: {}, elapsedMs: 0 });
  const listeners = new Set();
  let data = load() ?? fresh();
  let sinceSave = 0;

  function load() {
    try {
      const raw = localStorage.getItem(saveKey);
      return raw ? { ...fresh(), ...JSON.parse(raw) } : null;
    } catch {
      return null;
    }
  }

  function save() {
    localStorage.setItem(saveKey, JSON.stringify(data));
    sinceSave = 0;
  }

  function emit(type, detail) {
    listeners.forEach((fn) => fn(type, detail));
  }

  const has = (flag) => Boolean(data.flags[flag]);
  const hasItem = (id) => data.inventory.includes(id);
  const hintLevel = (puzzleId) => data.hints[puzzleId] ?? 0;

  function set(flag, value = true) {
    if (data.flags[flag] === value) return;
    data.flags[flag] = value;
    save();
    emit('flag', flag);
  }

  function addItem(id) {
    if (hasItem(id)) return;
    data.inventory.push(id);
    save();
    emit('item', id);
  }

  function removeItem(id) {
    if (!hasItem(id)) return;
    data.inventory = data.inventory.filter((i) => i !== id);
    save();
    emit('item', id);
  }

  function revealHint(puzzleId) {
    data.hints[puzzleId] = hintLevel(puzzleId) + 1;
    save();
    emit('hint', puzzleId);
  }

  function tick(dt) {
    data.elapsedMs += dt * 1000;
    sinceSave += dt * 1000;
    if (sinceSave > SAVE_EVERY_MS) save();
  }

  function reset() {
    data = fresh();
    localStorage.removeItem(saveKey);
    emit('reset');
  }

  window.addEventListener('beforeunload', save);

  return {
    has,
    set,
    hasItem,
    addItem,
    removeItem,
    hintLevel,
    revealHint,
    tick,
    reset,
    get inventory() { return [...data.inventory]; },
    get elapsedMs() { return data.elapsedMs; },
    on(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
