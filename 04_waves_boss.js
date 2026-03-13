/* ===== Waves & Boss ===== */
function spawnWave(n){
  enemies.length = 0; boss = null;
  const col = 7, row = 3 + Math.min(3, Math.floor((n-1)/2));
  const gapX = 18, gapY = 26;
  const gridW = W - 40;
  const ew = Math.floor((gridW - (col-1)*gapX) / col);
  const eh = 18;

  const hpScale = ENEMY.baseHP + (n-1) * 0.2;
  const spdScale = ENEMY.baseSpeed + (n-1) * 4;

  for (let r=0; r<row; r++){
    for (let c=0; c<col; c++){
      const x = 20 + c*(ew + gapX);
      const y = 40 + r*(eh + gapY);
      const type = (r % 4);
      let hp = Math.round(hpScale * (type===2 ? 1.6 : 1.0));
      let fireRate = 5000 - (n*10) + (type===1? -150:0) + (type===2? 200:0);
      enemies.push({
        x, y, w: ew, h: eh, type, hp,
        baseX: x, baseY: y, t: 0, speed: spdScale,
        fireCd: rand(400, fireRate),
        _flashTimer: 0
      });
    }
  }

  if (n % 5 === 0){
    enemies.length = 0;
    boss = { x: W/2 - 50, y: 80, w: 100, h: 36, hp: BOSS.hpBase + (n/5-1)*40, vx: 60, vy: 0, fireCd: 600, phase: 0, _flashTimer: 0 };
  }
}
