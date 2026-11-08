// Persistencia en localStorage + reinicio semanal (EU: miércoles 04:00 UTC)
const STORE_KEY = 'wow-codex-v1';

const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return { chars: d.chars || [], tasks: d.tasks || structuredClone(DEFAULT_TASKS), weekKey: d.weekKey || '', raids: d.raids || structuredClone(DEFAULT_RAIDS) };
      }
    } catch (e) { console.warn('No se pudo leer el guardado', e); }
    return { chars: [], tasks: structuredClone(DEFAULT_TASKS), weekKey: '', raids: structuredClone(DEFAULT_RAIDS) };
  },
  save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { console.warn('No se pudo guardar', e); }
  },
};

// Último reinicio EU (miércoles 04:00 UTC)
function lastReset(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));
  const diff = (d.getUTCDay() - 3 + 7) % 7; // 3 = miércoles
  d.setUTCDate(d.getUTCDate() - diff);
  if (d > now) d.setUTCDate(d.getUTCDate() - 7);
  return d;
}
function nextReset(now = new Date()) {
  const d = lastReset(now); d.setUTCDate(d.getUTCDate() + 7); return d;
}
