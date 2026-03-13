/* ===== Config & Canvas ===== */
const VERSION = 'v0.6f by kentmagic';
const LS_KEY_V2 = 'galactic_defender_best_v002';
const LS_KEY_V1 = 'galactic_defender_best_v001';
const LS_SKIN   = 'galactic_player_skin_v1';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const board = document.getElementById('board');
let dpr = window.devicePixelRatio || 1;
let W = 768, H = 1024;

function resizeCanvas(){
  const rect = board.getBoundingClientRect();
  const scale = Math.min(rect.width / 768, rect.height / 1024);
  W = Math.round(768 * scale);
  H = Math.round(1024 * scale);
  dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
