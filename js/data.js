// Datos de referencia de World of Warcraft
const CLASSES = {
  dk:  { name: 'Caballero de la Muerte', color: '#C41E3A', icon: '💀', specs: [['Sangre','T'],['Escarcha','D'],['Profano','D']] },
  dh:  { name: 'Cazador de demonios',    color: '#A330C9', icon: '🦇', specs: [['Devastación','D'],['Venganza','T'],['Devorador','D']] },
  dru: { name: 'Druida',                 color: '#FF7C0A', icon: '🐾', specs: [['Equilibrio','D'],['Feral','D'],['Guardián','T'],['Restauración','H']] },
  evo: { name: 'Evocador',               color: '#33937F', icon: '🐉', specs: [['Devastación','D'],['Preservación','H'],['Aumento','D']] },
  hun: { name: 'Cazador',                color: '#AAD372', icon: '🏹', specs: [['Bestias','D'],['Puntería','D'],['Supervivencia','D']] },
  mag: { name: 'Mago',                   color: '#3FC7EB', icon: '🔮', specs: [['Arcano','D'],['Fuego','D'],['Escarcha','D']] },
  mon: { name: 'Monje',                  color: '#00FF98', icon: '☯️', specs: [['Maestro cervecero','T'],['Tejedor de niebla','H'],['Viajero del viento','D']] },
  pal: { name: 'Paladín',                color: '#F48CBA', icon: '🔆', specs: [['Sagrado','H'],['Protección','T'],['Reprensión','D']] },
  pri: { name: 'Sacerdote',              color: '#FFFFFF', icon: '✝️', specs: [['Disciplina','H'],['Sagrado','H'],['Sombra','D']] },
  rog: { name: 'Pícaro',                 color: '#FFF468', icon: '🗡️', specs: [['Asesinato','D'],['Forajido','D'],['Sutileza','D']] },
  sha: { name: 'Chamán',                 color: '#0070DD', icon: '⚡', specs: [['Elemental','D'],['Mejora','D'],['Restauración','H']] },
  wlk: { name: 'Brujo',                  color: '#8788EE', icon: '🔥', specs: [['Aflicción','D'],['Demonología','D'],['Destrucción','D']] },
  war: { name: 'Guerrero',               color: '#C69B6D', icon: '⚔️', specs: [['Armas','D'],['Furia','D'],['Protección','T']] },
};

const ROLES = { T: { name: 'Tanque', icon: '🛡️' }, H: { name: 'Sanador', icon: '💚' }, D: { name: 'DPS', icon: '⚔️' } };

const RACES = {
  Alianza: ['Humano','Enano','Elfo de la noche','Gnomo','Draenei','Huargen','Pandaren','Dracthyr','Terráneo','Haranir',
            'Elfo del Vacío','Draenei forjado por la Luz','Enano Hierro Negro','Kultirano','Mecagnomo','Otra'],
  Horda:   ['Orco','No-muerto','Tauren','Trol','Elfo de sangre','Goblin','Pandaren','Dracthyr','Terráneo','Haranir',
            'Nocheterna','Tauren Monte Alto','Orco Mag\'har','Trol zandalari','Vulpera','Otra'],
};

const PROFESSIONS = [
  { id: 'alq', name: 'Alquimia',       icon: '⚗️', type: 'craft' },
  { id: 'her', name: 'Herrería',       icon: '⚒️', type: 'craft' },
  { id: 'enc', name: 'Encantamiento',  icon: '✨', type: 'craft' },
  { id: 'ing', name: 'Ingeniería',     icon: '⚙️', type: 'craft' },
  { id: 'ins', name: 'Inscripción',    icon: '📜', type: 'craft' },
  { id: 'joy', name: 'Joyería',        icon: '💎', type: 'craft' },
  { id: 'pel', name: 'Peletería',      icon: '🥾', type: 'craft' },
  { id: 'sas', name: 'Sastrería',      icon: '🧵', type: 'craft' },
  { id: 'hie', name: 'Herboristería',  icon: '🌿', type: 'gather' },
  { id: 'min', name: 'Minería',        icon: '⛏️', type: 'gather' },
  { id: 'des', name: 'Desuello',       icon: '🔪', type: 'gather' },
];

const SECONDARY = [
  { id: 'coc', name: 'Cocina',      icon: '🍳' },
  { id: 'pes', name: 'Pesca',       icon: '🎣' },
  { id: 'arq', name: 'Arqueología', icon: '🏺' },
];

const DEFAULT_TASKS = [
  { id: 't1', name: 'Gran Cámara (M+)' },
  { id: 't2', name: 'Banda semanal' },
  { id: 't3', name: 'Jefe de mundo' },
  { id: 't4', name: 'Misión semanal de profesión' },
  { id: 't5', name: 'Tratados / conocimiento de profesión' },
];

const DEMO = [
  { name: 'Sandriu', realm: 'Sanguino', faction: 'Horda', race: 'Elfo de sangre', cls: 'pal', spec: 'Sagrado', main: true,
    level: 80, ilvl: 652, mplus: 2450, gold: 184500, raid: '8/8 N · 6/8 H',
    profs: [{ id: 'joy', skill: 100, max: 100, notes: 'Especialización en engarces' }, { id: 'min', skill: 87, max: 100, notes: '' }],
    sec: { coc: 100, pes: 45, arq: 0 }, notes: 'Main de banda. Falta montura de la gloria.' },
  { name: 'Nyxia', realm: 'Sanguino', faction: 'Horda', race: 'Nocheterna', cls: 'mag', spec: 'Fuego', main: false,
    level: 80, ilvl: 631, mplus: 1820, gold: 42300, raid: '8/8 N',
    profs: [{ id: 'sas', skill: 72, max: 100, notes: '' }, { id: 'enc', skill: 100, max: 100, notes: 'Desencantar todo aquí' }],
    sec: { coc: 20, pes: 0, arq: 0 }, notes: '' },
  { name: 'Grumbold', realm: 'Tyrande', faction: 'Alianza', race: 'Enano Hierro Negro', cls: 'war', spec: 'Protección', main: false,
    level: 74, ilvl: 590, mplus: 0, gold: 9800, raid: '',
    profs: [{ id: 'her', skill: 55, max: 100, notes: '' }, { id: 'min', skill: 60, max: 100, notes: '' }],
    sec: { coc: 0, pes: 80, arq: 30 }, notes: 'Subir a 80 antes del parche.' },
];
