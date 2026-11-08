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
  { id: 't3', name: 'Jefe de mundo' },
  { id: 't4', name: 'Misión semanal de profesión' },
  { id: 't5', name: 'Tratados / conocimiento de profesión' },
];

const DEMO = [
  { name: 'Sandriu', realm: 'Sanguino', faction: 'Horda', race: 'Elfo de sangre', cls: 'pal', spec: 'Sagrado', main: true,
    region: 'eu', level: 90, ilvl: 298, mplus: 2450, gold: 184500, raid: '8/8 N · 5/8 H',
    profs: [{ id: 'joy', skill: 100, max: 100, notes: 'Especialización en engarces' }, { id: 'min', skill: 87, max: 100, notes: '' }],
    sec: { coc: 100, pes: 45, arq: 0 }, notes: 'Main de banda. Falta montura de la gloria.',
    week: { mplus: [12, 11, 10, 10, 9], world: [8, 8, 6], raid: { 'the-venomous-abyss': { 0: ['N','H'], 1: ['N','H'], 2: ['N','H'], 3: ['N'], 4: ['N'] } } } },
  { name: 'Nyxia', realm: 'Sanguino', faction: 'Horda', race: 'Nocheterna', cls: 'mag', spec: 'Fuego', main: false,
    region: 'eu', level: 90, ilvl: 287, mplus: 1820, gold: 42300, raid: '8/8 N',
    profs: [{ id: 'sas', skill: 72, max: 100, notes: '' }, { id: 'enc', skill: 100, max: 100, notes: 'Desencantar todo aquí' }],
    sec: { coc: 20, pes: 0, arq: 0 }, notes: '',
    week: { mplus: [7], world: [], raid: { 'the-venomous-abyss': { 0: ['N'], 1: ['N'] } } } },
  { name: 'Grumbold', realm: 'Tyrande', faction: 'Alianza', race: 'Enano Hierro Negro', cls: 'war', spec: 'Protección', main: false,
    region: 'eu', level: 84, ilvl: 240, mplus: 0, gold: 9800, raid: '',
    profs: [{ id: 'her', skill: 55, max: 100, notes: '' }, { id: 'min', skill: 60, max: 100, notes: '' }],
    sec: { coc: 0, pes: 80, arq: 30 }, notes: 'Subir a 80 antes del parche.' },
];

const MAX_LEVEL = 90;

// ---- Bandas (editables desde la pestaña Bandas) ----
const DEFAULT_RAIDS = [
  { id: 'the-venomous-abyss', name: 'The Venomous Abyss',
    bosses: ["Nek'zali the Soulcoiler", 'Entombed Sentinels', 'The Lost Explorers', 'Vashnik the Malignant',
             'Sszorak', 'The Twin Fangs', 'The Coiled Altar', "Ula'tek"] },
];

// Dificultades (rank sirve para saber cuál es mejor)
const DIFFS = [
  { id: 'L', name: 'Buscador', short: 'BdB', rank: 1, color: '#1eff00' },
  { id: 'N', name: 'Normal',   short: 'N',   rank: 2, color: '#0070dd' },
  { id: 'H', name: 'Heroico',  short: 'H',   rank: 3, color: '#a335ee' },
  { id: 'M', name: 'Mítico',   short: 'M',   rank: 4, color: '#ff8000' },
];

// ---- Gran Cámara: actividades necesarias para cada hueco ----
const VAULT = {
  raid:  { name: 'Banda',      icon: '🐲', thresholds: [2, 4, 6], unit: 'jefes' },
  mplus: { name: 'Mazmorras',  icon: '🗝️', thresholds: [1, 4, 8], unit: 'mazmorras' },
  world: { name: 'Mundo',      icon: '🌍', thresholds: [2, 4, 8], unit: 'actividades' },
};

// ---- Traducciones de Raider.IO (inglés → claves de la web) ----
const RIO_CLASS = {
  'Death Knight': 'dk', 'Demon Hunter': 'dh', 'Druid': 'dru', 'Evoker': 'evo', 'Hunter': 'hun', 'Mage': 'mag',
  'Monk': 'mon', 'Paladin': 'pal', 'Priest': 'pri', 'Rogue': 'rog', 'Shaman': 'sha', 'Warlock': 'wlk', 'Warrior': 'war',
};
// Mismo orden que CLASSES[x].specs
const RIO_SPECS = {
  dk: ['Blood', 'Frost', 'Unholy'], dh: ['Havoc', 'Vengeance', 'Devourer'],
  dru: ['Balance', 'Feral', 'Guardian', 'Restoration'], evo: ['Devastation', 'Preservation', 'Augmentation'],
  hun: ['Beast Mastery', 'Marksmanship', 'Survival'], mag: ['Arcane', 'Fire', 'Frost'],
  mon: ['Brewmaster', 'Mistweaver', 'Windwalker'], pal: ['Holy', 'Protection', 'Retribution'],
  pri: ['Discipline', 'Holy', 'Shadow'], rog: ['Assassination', 'Outlaw', 'Subtlety'],
  sha: ['Elemental', 'Enhancement', 'Restoration'], wlk: ['Affliction', 'Demonology', 'Destruction'],
  war: ['Arms', 'Fury', 'Protection'],
};
const RIO_RACE = {
  'Human': 'Humano', 'Dwarf': 'Enano', 'Night Elf': 'Elfo de la noche', 'Gnome': 'Gnomo', 'Draenei': 'Draenei',
  'Worgen': 'Huargen', 'Pandaren': 'Pandaren', 'Dracthyr': 'Dracthyr', 'Earthen': 'Terráneo', 'Haranir': 'Haranir',
  'Void Elf': 'Elfo del Vacío', 'Lightforged Draenei': 'Draenei forjado por la Luz', 'Dark Iron Dwarf': 'Enano Hierro Negro',
  'Kul Tiran': 'Kultirano', 'Mechagnome': 'Mecagnomo', 'Orc': 'Orco', 'Undead': 'No-muerto', 'Tauren': 'Tauren',
  'Troll': 'Trol', 'Blood Elf': 'Elfo de sangre', 'Goblin': 'Goblin', 'Nightborne': 'Nocheterna',
  'Highmountain Tauren': 'Tauren Monte Alto', "Mag'har Orc": "Orco Mag'har", 'Zandalari Troll': 'Trol zandalari',
  'Vulpera': 'Vulpera',
};
