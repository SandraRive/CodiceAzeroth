// ☁️ Sincronización con Firebase: login con Google + Firestore (users/{uid})
import { firebaseConfig } from './firebase-config.js';
window.CloudLoaded = true;

const SDK = 'https://www.gstatic.com/firebasejs/11.0.2/';
const box = document.getElementById('account');
const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('TU_');

// JSON con claves ordenadas, para comparar datos sin falsos positivos
const stable = v => JSON.stringify(v, (k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x);
const sameData = (a, b) => stable({ c: a.chars, t: a.tasks, r: a.raids }) === stable({ c: b.chars, t: b.tasks, r: b.raids });
const plain = s => JSON.parse(JSON.stringify({ chars: s.chars, tasks: s.tasks, weekKey: s.weekKey, raids: s.raids }));

// ---- Pantalla de inicio de sesión ----
const gate = document.getElementById('gate');
const gateBtn = document.getElementById('gateLogin');
const gateMsg = document.getElementById('gateMsg');
const gateOffline = document.getElementById('gateOffline');
const msg = (html, busy = false) => { gateMsg.innerHTML = (busy ? '<span class="spin"></span> ' : '') + html; };
function showGate() {
  document.body.classList.add('locked');
  gate.classList.remove('out'); gate.hidden = false;
  gateBtn.disabled = false; msg('');
}
function hideGate() {
  document.body.classList.remove('locked');
  gate.classList.add('out');
  setTimeout(() => { gate.hidden = true; }, 500);
}
gateOffline.onclick = hideGate;

if (!configured) {
  msg('⚠️ Falta tu configuración de Firebase en <b>js/firebase-config.js</b> (siguen los valores TU_…)');
  box.innerHTML = '<span class="acc-off" title="Rellena js/firebase-config.js para activar la nube">☁️ Solo local</span>';
} else {
  init().catch(e => {
    console.error(e);
    box.innerHTML = '<span class="acc-off">⚠️ Nube no disponible</span>';
    msg('⚠️ No se pudo conectar con el servidor.');
    gateOffline.hidden = false;
  });
}

async function init() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js'),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user = null, ref = null, ready = false, unsub = null, timer = null, status = 'idle';

  const setStatus = s => { status = s; const d = box.querySelector('.sync'); if (d) { d.dataset.s = s; d.title = LABEL[s]; } };
  const LABEL = { idle: 'Sincronizado', saving: 'Guardando…', error: 'Error al sincronizar', loading: 'Cargando…' };

  async function write(state) {
    setStatus('saving');
    try {
      await F.setDoc(ref, { ...plain(state), updatedAt: F.serverTimestamp() });
      setStatus('idle');
    } catch (e) {
      console.error(e); setStatus('error');
      App.toast('⚠️ No se pudo guardar en la nube (' + (e.code || 'error') + ')');
    }
  }

  window.Cloud = {
    push(state) {
      if (!user || !ready) return;
      setStatus('saving');
      clearTimeout(timer);
      timer = setTimeout(() => write(state), 800);
    },
  };

  function renderAccount() {
    if (!user) {
      box.innerHTML = '<button class="btn google" id="btnLogin"><span class="g">G</span> Iniciar sesión</button>';
      box.querySelector('#btnLogin').onclick = login;
      return;
    }
    const first = (user.displayName || user.email || 'Aventurera').split(' ')[0];
    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer">`
      : `<span class="ini">${first[0].toUpperCase()}</span>`;
    box.innerHTML = `<div class="who-acc" title="${user.email || ''}">${avatar}<span>${first}</span>
      <i class="sync" data-s="${status}" title="${LABEL[status]}"></i></div>
      <button class="btn sm" id="btnLogout">Salir</button>`;
    box.querySelector('#btnLogout').onclick = async () => {
      await A.signOut(auth);
      // Limpia la copia local para que nadie más vea tus datos en este navegador
      App.setState({ chars: [] });
    };
  }

  gateBtn.onclick = login;

  async function login() {
    gateBtn.disabled = true; msg('Esperando a Google…', true);
    try {
      await A.signInWithPopup(auth, provider);
    } catch (e) {
      gateBtn.disabled = false; msg('');
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      if (e.code === 'auth/popup-blocked') { msg('⚠️ El navegador ha bloqueado la ventana. Permite las ventanas emergentes.'); return; }
      if (e.code === 'auth/unauthorized-domain')
        msg('⚠️ Añade <b>' + location.hostname + '</b> en Authentication → Configuración → Dominios autorizados');
      else msg('⚠️ No se pudo iniciar sesión (' + e.code + ')');
      console.error(e);
    }
  }

  A.onAuthStateChanged(auth, async u => {
    user = u; ready = false; unsub?.(); unsub = null; clearTimeout(timer);
    renderAccount();
    if (!u) { showGate(); return; }
    msg('Abriendo tu códice…', true);

    ref = F.doc(db, 'users', u.uid);
    setStatus('loading');
    try {
      const snap = await F.getDoc(ref);
      const local = App.state;
      if (snap.exists()) {
        const d = snap.data();
        const remote = App.normalize({ chars: d.chars || [], tasks: d.tasks || App.defaultTasks(), weekKey: d.weekKey || '', raids: d.raids || App.state.raids });
        if (!local.chars.length || sameData(local, remote)) {
          App.setState(remote);
        } else if (confirm(
          'Tu cuenta ya tiene datos y no coinciden con los de este navegador.\n\n' +
          'ACEPTAR → usar los datos de tu cuenta\n' +
          'CANCELAR → subir los de este navegador (reemplaza los de la nube)')) {
          App.setState(remote);
        } else {
          await write(local);
        }
      } else {
        await write(local);
        if (local.chars.length) App.toast('☁️ Tus personajes se han subido a tu cuenta');
      }
      ready = true;
      setStatus('idle');
      hideGate();
      App.toast(`⚔️ ¡Bienvenida, ${(u.displayName || '').split(' ')[0] || 'aventurera'}!`);

      // Cambios desde otros dispositivos, en tiempo real
      unsub = F.onSnapshot(ref, s => {
        if (!s.exists() || s.metadata.hasPendingWrites) return;
        const d = s.data();
        const remote = App.normalize({ chars: d.chars || [], tasks: d.tasks || App.defaultTasks(), weekKey: d.weekKey || '', raids: d.raids || App.state.raids });
        if (!sameData(remote, App.state)) App.setState(remote);
      });
    } catch (e) {
      console.error(e); setStatus('error');
      gateBtn.disabled = false;
      msg(e.code === 'permission-denied'
        ? '⚠️ Firestore ha denegado el acceso: revisa las reglas'
        : '⚠️ Error con la nube (' + (e.code || e.message) + ')');
    }
  });
}
