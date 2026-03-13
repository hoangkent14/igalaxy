/* ===== Shooting & Powers ===== */
function tryShoot(dtMs){
  player.cooldown -= dtMs;
  if (player.cooldown > 0) return;

  if (!input.fire) return;

  const hasSpread = player.spreadUntil > nowMs();
  const rateFactor = (player.rapidUntil > nowMs()) ? POWER.rapid.factor : 1.0;
  const cd = player.fireRate * rateFactor;
  player.cooldown = cd;

  const baseSpeed = 460;
  const bullet = { x: player.x, y: player.y - player.h/2 - 6, vx: 0, vy: -baseSpeed, r: 3.2, dmg: 1, friendly: true, color: COLORS.bullet };
  bullets.push(bullet);

  if (hasSpread){
    const ang = PLAYER.spreadAngle;
    bullets.push(
      { x: player.x, y: bullet.y, vx: baseSpeed*Math.sin(-ang), vy: -baseSpeed*Math.cos(ang), r: 3, dmg: 1, friendly:true, color: COLORS.spread },
      { x: player.x, y: bullet.y, vx: baseSpeed*Math.sin(ang),  vy: -baseSpeed*Math.cos(ang), r: 3, dmg: 1, friendly:true, color: COLORS.spread }
    );
  }
}

function tryDrone(dtMs){
  if (player.droneUntil < nowMs()) return;
  player.droneCooldown -= dtMs;
  if (player.droneCooldown > 0) return;
  player.droneCooldown = POWER.drone.rate;
  const s = 14;
  bullets.push({ x: player.x - s, y: player.y - 6, vx: 0, vy: -420, r: 2.6, dmg: 1, friendly:true, color: COLORS.drone });
  bullets.push({ x: player.x + s, y: player.y - 6, vx: 0, vy: -420, r: 2.6, dmg: 1, friendly:true, color: COLORS.drone });
}

/* tốc độ bắn enemy */
function enemyTryShoot(e, dtMs){
  e.fireCd -= dtMs;
  if (e.fireCd > 0) return;
  e.fireCd = 4000 + rand(-200, 200);
  const sp = 200 + rand(-20,20);
  enemyBullets.push({ x: e.x + e.w/2, y: e.y + e.h, vx: 0, vy: sp, r: 3, dmg: 1, friendly:false, color: COLORS.enemyBullet });
}

function spawnPower(x,y){
  if (Math.random() >= 0.20) return;
  const types = ['shield','rapid','spread','drone'];
  const type = types[Math.floor(Math.random()*types.length)];
  powerUps.push({ x, y, vy: 60+rand(-10,10), type, r: 9 });
}
function spawnPowerForced(x,y){
  const types = ['shield','rapid','spread','drone'];
  const type = types[Math.floor(Math.random()*types.length)];
  powerUps.push({ x, y, vy: 60+rand(-10,10), type, r: 9 });
}
function applyPower(p){
  switch(p.type){
    case 'shield': player.shieldUntil = nowMs() + POWER.shield.time; break;
    case 'rapid':  player.rapidUntil  = nowMs() + POWER.rapid.time;  break;
    case 'spread': player.spreadUntil = nowMs() + POWER.spread.time; break;
    case 'drone':  player.droneUntil  = nowMs() + POWER.drone.time;  player.droneCooldown = 0; break;
  }
}
