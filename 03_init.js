/* ===== Init ===== */
function init(){
  const b1 = parseInt(localStorage.getItem(LS_KEY_V1) || '0', 10);
  const b2 = parseInt(localStorage.getItem(LS_KEY_V2) || '0', 10);
  best = Math.max(b1, b2);

  score = 0; lives = 3; level = 1;
  running = false; paused = false; lost = false;

  bullets = []; enemyBullets = []; enemies = []; powerUps = []; particles = []; boss = null;

  resizeCanvas();

  player = {
    x: W/2, y: H - 60, w: PLAYER.w, h: PLAYER.h,
    cooldown: 0, fireRate: PLAYER.baseCooldown,
    shieldUntil: 0, rapidUntil: 0, spreadUntil: 0,
    droneUntil: 0, droneCooldown: 0,
    invUntil: 0
  };

  spawnWave(level);

  lastTime = performance.now(); acc = 0;
  updateHUD();
  draw();
}
