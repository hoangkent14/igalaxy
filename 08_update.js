/* ===== Update ===== */
function update(dt){
  const dtMs = dt*1000;
  // Movement 4 hướng với chuẩn hoá vector
  const halfW = (player?.w || PLAYER.w)/2; const halfH = (player?.h || PLAYER.h)/2;
  const mx = (input.right ? 1 : 0) - (input.left ? 1 : 0); const my = (input.down  ? 1 : 0) - (input.up   ? 1 : 0);
  if (mx !== 0 || my !== 0){ const len = Math.hypot(mx, my); const sp = PLAYER.speed * dt; player.x += (mx/len) * sp; player.y += (my/len) * sp; }
  player.x = clamp(player.x, SIDE_MARGIN + halfW, W - SIDE_MARGIN - halfW); player.y = clamp(player.y, TOP_BOUND + halfH, H - BOTTOM_MARGIN - halfH);
  tryShoot(dtMs); tryDrone(dtMs);

  // Player bullets
  for (let i=bullets.length-1; i>=0; i--){
    const b = bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y < -20 || b.y > H+20 || b.x < -20 || b.x > W+20) { bullets.splice(i,1); continue; }

    if (boss){
      if (circleRectCollide(b.x, b.y, b.r, boss.x, boss.y, boss.w, boss.h)){
        boss.hp -= b.dmg; bullets.splice(i,1);
        boss._flashTimer = 120;
        boom(b.x,b.y,'#ffffff',4,60);
        if (boss.hp <= 0){
          boom(boss.x+boss.w/2,boss.y+boss.h/2,'#f43f5e',36,260);
          score += 500;
          for (let k=0;k<3;k++) spawnPowerForced(boss.x + boss.w/2 + rand(-20,20), boss.y + boss.h/2 + rand(-10,10));
          boss = null; updateHUD(); level++; spawnWave(level);
        }
      }
    } else {
      for (let j=enemies.length-1; j>=0; j--){
        const e = enemies[j];
        if (circleRectCollide(b.x, b.y, b.r, e.x, e.y, e.w, e.h)){
          e.hp -= b.dmg; bullets.splice(i,1);
          boom(b.x,b.y,'#ffffff',4,60);
          e._flashTimer = 90;

          if (e.hp <= 0){
            const cols = ['#fff','#a78bfa','#60a5fa','#fbbf24','#34d399'];
            boom(e.x+e.w/2,e.y+e.h/2, cols[e.type+1] || '#fff', 14, 180);
            score += 20 + Math.floor(level*1.5);
            spawnPower(e.x + e.w/2, e.y + e.h/2);
            enemies.splice(j,1);
            updateHUD();
            if (!boss && enemies.length===0){
              score += 100; updateHUD();
              if (Math.random() < 0.5) spawnPowerForced(W/2, 120);
              level++; spawnWave(level);
            }
          }
          break;
        }
      }
    }
  }

  // Enemies move & shoot
  if (boss){
    boss.x += boss.vx * dt;
    if (boss.x < 10 || boss.x + boss.w > W-10) boss.vx *= -1;

    boss.fireCd -= dtMs;
    if (boss.fireCd <= 0){
      boss.fireCd = BOSS.fireRate + rand(-200,200);
      const cx = boss.x + boss.w/2, cy = boss.y + boss.h;
      if (boss.phase % 2 === 0){
        for (let k=-1; k<=1; k++){
          enemyBullets.push({ x: cx, y: cy, vx: 120*k, vy: 220 + rand(-30,30), r: 3.2, dmg: 1, friendly:false, color: COLORS.enemyBullet });
        }
      } else {
        const dx = player.x - cx;
        const dy = (player.y - 8) - cy;
        const len = Math.max(1, Math.hypot(dx, dy));
        const speed = 280;
        enemyBullets.push({ x: cx, y: cy, vx: speed*dx/len, vy: speed*dy/len, r: 3.2, dmg: 1, friendly:false, color: COLORS.enemyBullet });
      }
      boss.phase++;
    }

    if (boss._flashTimer && boss._flashTimer > 0){
      boss._flashTimer = Math.max(0, boss._flashTimer - dtMs);
    }

  } else {
    for (const e of enemies){
      e.t += dt;
      if (e.type===0){ e.x = e.baseX + Math.sin(e.t*1.6) * 16; }
      else if (e.type===1){ e.x = e.baseX + Math.sin(e.t*2.0) * 22; e.y = e.baseY + Math.sin(e.t*1.3) * 6 + e.t*2.2; }
      else if (e.type===2){
        e.x += (e.t%1<0.5?1:-1) * e.speed * dt * 0.5;
        if (e.x < 10){ e.x = 10; e.baseX += 10; }
        if (e.x + e.w > W-10){ e.x = W-10-e.w; e.baseX -= 10; }
      } else if (e.type===3){
        const towards = Math.sign((player.x) - (e.x + e.w/2));
        e.x += towards * e.speed * dt * 0.3;
        e.y = e.baseY + Math.sin(e.t*2.2)*10 + Math.sin(e.t*0.6)*12;
      }

      enemyTryShoot(e, dtMs);

      if (e.y + e.h > H - 100){
        hitPlayer(true);
        break;
      }

      if (e._flashTimer && e._flashTimer > 0){
        e._flashTimer = Math.max(0, e._flashTimer - dtMs);
      }
    }

    // collision: enemy vs player
    const px = player.x - player.w/2, py = player.y - player.h/2;
    for (let j=enemies.length-1; j>=0; j--){
      const e = enemies[j];
      if (circleRectCollide(e.x + e.w/2, e.y + e.h/2, Math.min(e.w, e.h)/2, px, py, player.w, player.h)){
        boom(e.x + e.w/2, e.y + e.h/2, '#fff', 10, 180);
        enemies.splice(j, 1);
        hitPlayer();
      }
    }
  }

  // Enemy bullets move + collide with player
  for (let i=enemyBullets.length-1; i>=0; i--){
    const b = enemyBullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y > H+30 || b.x < -30 || b.x > W+30) { enemyBullets.splice(i,1); continue; }

    const px = player.x - player.w/2, py = player.y - player.h/2;
    if (circleRectCollide(b.x, b.y, b.r, px, py, player.w, player.h)){
      enemyBullets.splice(i,1);
      if (player.shieldUntil > nowMs()){ boom(b.x,b.y,COLORS.shield,10,160); navigator.vibrate?.(40); }
      else { hitPlayer(); }
    }
  }

  // PowerUps
  for (let i=powerUps.length-1; i>=0; i--){
    const p = powerUps[i];
    p.y += p.vy * dt;
    const px = player.x - player.w/2, py = player.y - player.h/2;
    if (circleRectCollide(p.x, p.y, p.r, px, py, player.w, player.h)){
      applyPower(p); powerUps.splice(i,1);
      boom(px+player.w/2, py, '#ffffff', 6, 120);
      continue;
    }
    if (p.y > H+20) powerUps.splice(i,1);
  }

  // Particles
  for (let i=particles.length-1; i>=0; i--){
    const pa = particles[i];
    pa.x += pa.vx * dt; pa.y += pa.vy * dt;
    pa.life -= dtMs;
    pa.vx *= 0.99;
    pa.vy = pa.vy * 0.99 + 6 * dt;
    if (pa.life <= 0) particles.splice(i,1);
  }

  // Avoid overgrowth
  if (bullets.length > 600) bullets.splice(0, bullets.length - 600);
  if (enemyBullets.length > 600) enemyBullets.splice(0, enemyBullets.length - 600);
  if (particles.length > 800) particles.splice(0, particles.length - 800);
}
