// ============ Códice de Azeroth ============
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const fmtGold = n => Number(n || 0).toLocaleString('es-ES');
const profById = id => PROFESSIONS.find(p => p.id === id);
const roleOf = c => (CLASSES[c.cls]?.specs.find(s => s[0] === c.spec) || [, 'D'])[1];

let state = Store.load();
let editingId = null;

// ---------- Reinicio semanal ----------
function checkReset() {
  const key = lastReset().toISOString();
  if (state.weekKey !== key) {
    state.chars.forEach(c => c.weekly = {});
    state.weekKey = key;
    persist();
  }
}

// Guarda en el navegador y, si hay sesión iniciada, en la nube
function persist() { Store.save(state); window.Cloud?.push(state); }
function save() { persist(); render(); }

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- Estadísticas ----------
function renderStats() {
  const cs = state.chars;
  const total = cs.length;
  const gold = cs.reduce((a, c) => a + (+c.gold || 0), 0);
  const max = cs.filter(c => +c.level >= 80).length;
  const best = cs.reduce((a, c) => Math.max(a, +c.ilvl || 0), 0);
  const covered = new Set(cs.flatMap(c => (c.profs || []).map(p => p.id))).size;
  const taskTotal = total * state.tasks.length;
  const taskDone = cs.reduce((a, c) => a + state.tasks.filter(t => c.weekly?.[t.id]).length, 0);
  const pct = taskTotal ? Math.round(taskDone / taskTotal * 100) : 0;
  $('#stats').innerHTML = [
    ['🧙', total, 'Personajes'],
    ['⬆️', max, 'A nivel máximo'],
    ['🗡️', best || '—', 'Mejor iLvl'],
    ['🪙', fmtGold(gold), 'Oro total'],
    ['⚒️', `${covered}/${PROFESSIONS.length}`, 'Profesiones cubiertas'],
    ['📅', pct + '%', 'Semana completada'],
  ].map(([i, v, l]) => `<div class="stat"><span class="si">${i}</span><b>${v}</b><small>${l}</small></div>`).join('');
}

// ---------- Personajes ----------
function filteredChars() {
  const q = $('#search').value.trim().toLowerCase();
  const fa = $('#fFaction').value, fc = $('#fClass').value, fr = $('#fRole').value, so = $('#sort').value;
  let list = state.chars.filter(c => {
    const hay = `${c.name} ${c.realm} ${CLASSES[c.cls]?.name} ${c.spec} ${c.race}`.toLowerCase();
    return (!q || hay.includes(q)) && (!fa || c.faction === fa) && (!fc || c.cls === fc) && (!fr || roleOf(c) === fr);
  });
  const by = {
    main: (a, b) => (b.main - a.main) || (b.ilvl - a.ilvl),
    ilvl: (a, b) => b.ilvl - a.ilvl,
    level: (a, b) => b.level - a.level,
    gold: (a, b) => b.gold - a.gold,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return list.sort(by[so]);
}

function profBar(p) {
  const pr = profById(p.id); if (!pr) return '';
  const pct = Math.min(100, Math.round((+p.skill || 0) / (+p.max || 100) * 100));
  return `<div class="pbar" title="${esc(p.notes)}">
    <span class="pn">${pr.icon} ${pr.name}</span>
    <span class="track"><i style="width:${pct}%"></i></span>
    <span class="pv">${+p.skill || 0}/${+p.max || 100}</span></div>`;
}

function renderChars() {
  const list = filteredChars();
  const grid = $('#charGrid');
  if (!state.chars.length) {
    grid.innerHTML = `<div class="empty"><div class="big">🏰</div><h3>Tu códice está vacío</h3>
      <p>Añade tu primer personaje o carga el ejemplo para ver cómo queda.</p>
      <div class="inline center"><button class="btn gold" data-act="add">＋ Nuevo personaje</button>
      <button class="btn" data-act="demo">✨ Cargar ejemplo</button></div></div>`;
    return;
  }
  if (!list.length) { grid.innerHTML = `<div class="empty"><p>Ningún personaje coincide con los filtros.</p></div>`; return; }
  grid.innerHTML = list.map(c => {
    const cl = CLASSES[c.cls] || CLASSES.war;
    const r = ROLES[roleOf(c)];
    const done = state.tasks.filter(t => c.weekly?.[t.id]).length;
    const wp = state.tasks.length ? Math.round(done / state.tasks.length * 100) : 0;
    const sec = SECONDARY.filter(s => +c.sec?.[s.id] > 0).map(s => `<span class="chip">${s.icon} ${s.name} ${c.sec[s.id]}</span>`).join('');
    return `<article class="card ${c.faction === 'Horda' ? 'horde' : 'alliance'}" style="--cc:${cl.color}" data-id="${c.id}">
      <div class="card-top">
        <div class="crest">${cl.icon}</div>
        <div class="who">
          <h3>${esc(c.name)} ${c.main ? '<span class="star" title="Principal">⭐</span>' : ''}</h3>
          <p>${esc(c.spec)} ${esc(cl.name)}</p>
          <p class="muted">${esc(c.race)} · ${esc(c.realm || 'Sin reino')}</p>
        </div>
        <div class="faction-badge" title="${c.faction}">${c.faction === 'Horda' ? '🔴' : '🔵'}</div>
      </div>
      <div class="nums">
        <div><b>${c.level}</b><small>Nivel</small></div>
        <div><b>${c.ilvl || '—'}</b><small>iLvl</small></div>
        <div><b>${c.mplus || '—'}</b><small>M+</small></div>
        <div><b>${r.icon}</b><small>${r.name}</small></div>
      </div>
      <div class="profs">${(c.profs || []).map(profBar).join('') || '<p class="muted small">Sin profesiones principales</p>'}</div>
      ${sec ? `<div class="chips">${sec}</div>` : ''}
      ${c.raid ? `<p class="raid">🐲 ${esc(c.raid)}</p>` : ''}
      ${c.notes ? `<p class="notes">${esc(c.notes)}</p>` : ''}
      <div class="card-foot">
        <span class="gold-amt">🪙 ${fmtGold(c.gold)}</span>
        <span class="wk" title="Semanales"><span class="track sm"><i style="width:${wp}%"></i></span>${done}/${state.tasks.length}</span>
        <button class="btn sm" data-act="edit" data-id="${c.id}">Editar</button>
      </div>
    </article>`;
  }).join('');
}

// ---------- Profesiones ----------
function renderProfs() {
  const holders = id => state.chars.flatMap(c => (c.profs || []).filter(p => p.id === id).map(p => ({ c, p })));
  $('#coverage').innerHTML = PROFESSIONS.map(p => {
    const h = holders(p.id);
    return `<button class="cov ${h.length ? 'on' : 'off'}" data-prof="${p.id}">
      <span class="ci">${p.icon}</span><b>${p.name}</b>
      <small>${h.length ? h.map(x => esc(x.c.name)).join(', ') : 'Sin cubrir'}</small></button>`;
  }).join('');

  const rows = PROFESSIONS.map(p => {
    const h = holders(p.id).sort((a, b) => b.p.skill - a.p.skill);
    if (!h.length) return '';
    return `<div class="pd" id="pd-${p.id}"><h3>${p.icon} ${p.name} <span class="tag">${p.type === 'gather' ? 'Recolección' : 'Fabricación'}</span></h3>
      ${h.map(({ c, p: pp }) => {
        const cl = CLASSES[c.cls];
        const pct = Math.min(100, Math.round(pp.skill / (pp.max || 100) * 100));
        return `<div class="pd-row" style="--cc:${cl.color}">
          <span class="pd-name">${cl.icon} ${esc(c.name)}</span>
          <span class="track"><i style="width:${pct}%"></i></span>
          <span class="pv">${pp.skill}/${pp.max}</span>
          <span class="pd-notes">${esc(pp.notes) || ''}</span></div>`;
      }).join('')}</div>`;
  }).join('');
  const secRows = SECONDARY.map(s => {
    const h = state.chars.filter(c => +c.sec?.[s.id] > 0);
    if (!h.length) return '';
    return `<div class="pd"><h3>${s.icon} ${s.name} <span class="tag">Secundaria</span></h3>
      ${h.map(c => `<div class="pd-row" style="--cc:${CLASSES[c.cls].color}"><span class="pd-name">${CLASSES[c.cls].icon} ${esc(c.name)}</span>
      <span class="track"><i style="width:${Math.min(100, c.sec[s.id])}%"></i></span><span class="pv">${c.sec[s.id]}</span><span></span></div>`).join('')}</div>`;
  }).join('');
  $('#profDetail').innerHTML = rows + secRows || '<p class="muted">Aún no hay profesiones registradas.</p>';
}

// ---------- Semanal ----------
function renderWeekly() {
  const nr = nextReset();
  const ms = nr - new Date();
  const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5);
  $('#resetInfo').textContent = `Se reinicia sola cada miércoles (EU). Próximo reinicio en ${d} d ${h} h — ${nr.toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}.`;

  $('#taskList').innerHTML = state.tasks.map(t =>
    `<span class="chip task">${esc(t.name)} <button data-act="deltask" data-id="${t.id}" title="Quitar">✕</button></span>`).join('');

  if (!state.chars.length) { $('#weeklyTable').innerHTML = '<p class="muted">Añade personajes para usar el checklist.</p>'; return; }
  const chars = [...state.chars].sort((a, b) => (b.main - a.main) || (b.ilvl - a.ilvl));
  $('#weeklyTable').innerHTML = `<table class="weekly"><thead><tr><th>Personaje</th>
    ${state.tasks.map(t => `<th>${esc(t.name)}</th>`).join('')}<th>Progreso</th></tr></thead><tbody>
    ${chars.map(c => {
      const cl = CLASSES[c.cls];
      const done = state.tasks.filter(t => c.weekly?.[t.id]).length;
      const pct = state.tasks.length ? Math.round(done / state.tasks.length * 100) : 0;
      return `<tr style="--cc:${cl.color}"><td class="wn">${cl.icon} <b>${esc(c.name)}</b></td>
        ${state.tasks.map(t => `<td><label class="tick"><input type="checkbox" data-act="tick" data-c="${c.id}" data-t="${t.id}" ${c.weekly?.[t.id] ? 'checked' : ''}><span></span></label></td>`).join('')}
        <td><div class="wprog"><span class="track"><i style="width:${pct}%"></i></span>${pct === 100 ? '🏆' : pct + '%'}</div></td></tr>`;
    }).join('')}</tbody></table>`;
}

function render() { renderStats(); renderChars(); renderProfs(); renderWeekly(); }

// ---------- Formulario ----------
const form = $('#charForm');

function fillRaces(faction, sel) {
  form.race.innerHTML = RACES[faction].map(r => `<option ${r === sel ? 'selected' : ''}>${r}</option>`).join('');
}
function fillSpecs(cls, sel) {
  form.spec.innerHTML = CLASSES[cls].specs.map(([s, r]) => `<option value="${s}" ${s === sel ? 'selected' : ''}>${ROLES[r].icon} ${s}</option>`).join('');
}
function profRowHTML(i, p = {}) {
  return `<div class="row prof-row">
    <label>Profesión ${i + 1}<select name="p${i}id"><option value="">— Ninguna —</option>
      ${PROFESSIONS.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${x.icon} ${x.name}</option>`).join('')}</select></label>
    <label class="narrow">Nivel<input type="number" name="p${i}skill" min="0" max="999" value="${p.skill ?? 1}"></label>
    <label class="narrow">Máx.<input type="number" name="p${i}max" min="1" max="999" value="${p.max ?? 100}"></label>
    <label>Especialización / notas<input name="p${i}notes" value="${esc(p.notes || '')}" placeholder="Ej: rama de armas"></label>
  </div>`;
}

function openForm(c = null) {
  editingId = c?.id || null;
  form.reset();
  $('#formTitle').textContent = c ? `Editar a ${c.name}` : 'Nuevo personaje';
  $('#btnDelete').hidden = !c;
  const d = c || { faction: 'Horda', cls: 'pal', level: 80, ilvl: 0, mplus: 0, gold: 0, profs: [], sec: {} };
  form.name.value = d.name || ''; form.realm.value = d.realm || '';
  form.faction.value = d.faction; fillRaces(d.faction, d.race);
  form.cls.value = d.cls; fillSpecs(d.cls, d.spec);
  form.main.checked = !!d.main;
  form.level.value = d.level; form.ilvl.value = d.ilvl; form.mplus.value = d.mplus; form.gold.value = d.gold;
  form.raid.value = d.raid || ''; form.notes.value = d.notes || '';
  $('#primProfs').innerHTML = [0, 1].map(i => profRowHTML(i, d.profs?.[i])).join('');
  $('#secProfs').innerHTML = SECONDARY.map(s =>
    `<label>${s.icon} ${s.name}<input type="number" name="s_${s.id}" min="0" max="999" value="${d.sec?.[s.id] || 0}"></label>`).join('');
  $('#modal').hidden = false;
  setTimeout(() => form.name.focus(), 50);
}
function closeForm() { $('#modal').hidden = true; editingId = null; }

form.faction.addEventListener('change', () => fillRaces(form.faction.value));
form.cls.addEventListener('change', () => fillSpecs(form.cls.value));

form.addEventListener('submit', e => {
  e.preventDefault();
  const profs = [0, 1].map(i => ({
    id: form[`p${i}id`].value, skill: +form[`p${i}skill`].value || 0,
    max: +form[`p${i}max`].value || 100, notes: form[`p${i}notes`].value.trim(),
  })).filter(p => p.id);
  if (profs.length === 2 && profs[0].id === profs[1].id) { toast('⚠️ No puedes repetir la misma profesión'); return; }
  const sec = Object.fromEntries(SECONDARY.map(s => [s.id, +form[`s_${s.id}`].value || 0]));
  const prev = state.chars.find(c => c.id === editingId);
  const c = {
    id: editingId || uid(), name: form.name.value.trim(), realm: form.realm.value.trim(),
    faction: form.faction.value, race: form.race.value, cls: form.cls.value, spec: form.spec.value,
    main: form.main.checked, level: +form.level.value || 1, ilvl: +form.ilvl.value || 0,
    mplus: +form.mplus.value || 0, gold: +form.gold.value || 0, raid: form.raid.value.trim(),
    profs, sec, notes: form.notes.value.trim(), weekly: prev?.weekly || {},
  };
  if (c.main) state.chars.forEach(x => x.main = false);
  if (prev) Object.assign(prev, c); else state.chars.push(c);
  closeForm(); save(); toast(prev ? `💾 ${c.name} actualizado` : `🎉 ${c.name} se une al códice`);
});

$('#btnDelete').addEventListener('click', () => {
  const c = state.chars.find(x => x.id === editingId);
  if (c && confirm(`¿Eliminar a ${c.name}? No se puede deshacer.`)) {
    state.chars = state.chars.filter(x => x.id !== editingId);
    closeForm(); save(); toast(`🪦 ${c.name} eliminado`);
  }
});
$$('[data-close]').forEach(b => b.addEventListener('click', closeForm));
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeForm(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeForm(); });

// ---------- Acciones globales ----------
function loadDemo() {
  state.chars = DEMO.map(d => ({ ...structuredClone(d), id: uid(), weekly: {} }));
  save(); toast('✨ Ejemplo cargado');
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'edit') openForm(state.chars.find(c => c.id === el.dataset.id));
  if (act === 'add') openForm();
  if (act === 'demo') loadDemo();
  if (act === 'deltask') { state.tasks = state.tasks.filter(t => t.id !== el.dataset.id); save(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'tick') {
    const c = state.chars.find(x => x.id === el.dataset.c);
    c.weekly = c.weekly || {}; c.weekly[el.dataset.t] = el.checked;
    const all = state.tasks.every(t => c.weekly[t.id]);
    save(); if (el.checked && all) toast(`🏆 ¡${c.name} ha terminado la semana!`);
  }
});

$('#btnAdd').addEventListener('click', () => openForm());
$('#btnAddTask').addEventListener('click', addTask);
$('#newTask').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
function addTask() {
  const v = $('#newTask').value.trim(); if (!v) return;
  state.tasks.push({ id: uid(), name: v }); $('#newTask').value = ''; save();
}

$('#coverage').addEventListener('click', e => {
  const b = e.target.closest('.cov.on'); if (!b) return;
  $(`#pd-${b.dataset.prof}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

['#search', '#fFaction', '#fClass', '#fRole', '#sort'].forEach(s => $(s).addEventListener('input', renderChars));

$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.toggle('active', x === t));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + t.dataset.view));
}));

// ---------- Datos ----------
$('#btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `codice-azeroth-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(a.href); toast('⬇️ Copia exportada');
});
$('#fileImport').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.chars)) throw new Error('formato');
    state = { chars: d.chars, tasks: d.tasks || structuredClone(DEFAULT_TASKS), weekKey: d.weekKey || '' };
    checkReset(); save(); toast(`⬆️ ${d.chars.length} personajes importados`);
  } catch { toast('⚠️ Archivo no válido'); }
  e.target.value = '';
});
$('#btnDemo').addEventListener('click', () => {
  if (!state.chars.length || confirm('Esto reemplaza tus personajes por los de ejemplo. ¿Seguir?')) loadDemo();
});
$('#btnWipe').addEventListener('click', () => {
  if (confirm('¿Borrar TODOS los personajes y tareas? Exporta antes si quieres conservarlos.')) {
    state = { chars: [], tasks: structuredClone(DEFAULT_TASKS), weekKey: lastReset().toISOString() };
    save(); toast('🗑️ Códice vaciado');
  }
});

// ---------- Inicio ----------
form.cls.innerHTML = Object.entries(CLASSES).map(([k, c]) => `<option value="${k}">${c.icon} ${c.name}</option>`).join('');
$('#fClass').innerHTML += Object.entries(CLASSES).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join('');
checkReset();
render();
setInterval(() => { checkReset(); renderWeekly(); }, 60000);

// Puente para cloud.js (Firebase)
window.App = {
  get state() { return state; },
  setState(s) {
    state = { chars: s.chars || [], tasks: s.tasks || structuredClone(DEFAULT_TASKS), weekKey: s.weekKey || '' };
    Store.save(state);
    checkReset();
    render();
  },
  toast,
  defaultTasks: () => structuredClone(DEFAULT_TASKS),
};
