/* ===== State ===== */
let score = 0, best = 0, lives = 3, level = 1;
let running = false, paused = false, lost = false;
let lastTime = 0, acc = 0, stepMs = 1000/120;

const input = { left:false, right:false, fire:false, dragging:false };
let spaceDownAt = 0;

let player, bullets = [], enemies = [], enemyBullets = [], powerUps = [], particles = [];
let boss = null;

/* Player skin (Blue | Red | Green) */
let PLAYER_SKIN = localStorage.getItem(LS_SKIN) || 'Red';

const COLORS = {
  star:'#0b1220', grid:'#0b1220',
  bullet:'#f8fafc', enemyBullet:'#f87171', spread:'#facc15',
  shield:'#34d399', drone:'#a78bfa'
};

const PLAYER = { w: 28, h: 20, speed: 360, baseCooldown: 200, spreadShots: 3, spreadAngle: 12*Math.PI/180, iFrame: 1200 };
const POWER = { shield:{time:8000}, rapid:{time:8000, factor:0.5}, spread:{time:8000}, drone:{time:15000, rate:260} };
const ENEMY = { baseSpeed: 40, baseHP: 10.0 };
const BOSS  = { hpBase: 60, speed: 40, fireRate: 400 };

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function rand(a,b){ return Math.random()*(b-a) + a; }
function nowMs(){ return performance.now(); }
