/* ===== Draw ===== */
function draw(){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0066cc'); g.addColorStop(1,'#021631');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  // Starfield 2 layers
  const time = Date.now() * 0.05;
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect((i * 113) % W, (i * 157 + time * 0.5) % H, 1, 1);
    if (i % 5 === 0) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.28)';
      ctx.fillRect((i * 167) % W, (i * 193 + time * 1.2) % H, 2, 2);
    }
  }

  // PowerUps
  powerUps.forEach(p=>{
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    const color = ({shield:'#34d399', rapid:'#22d3ee', spread:'#facc15', drone:'#a78bfa'})[p.type];
    ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = '#04121c'; ctx.font = '10px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    const label = ({shield:'S', rapid:'R', spread:'P', drone:'D'})[p.type];
    ctx.fillText(label, p.x, p.y+0.5);
  });

  // Boss or Enemies
  if (boss){
    const bossMaxHp = 60 + (Math.floor(level/5)-1)*40;
    const hpRatio = Math.max(0, boss.hp / bossMaxHp);
    drawBossScary(boss, {
      t: nowMs(), px: player.x, py: player.y,
      hpRatio, hitFlash: (boss._flashTimer||0) > 0
    });
  } else {
    enemies.forEach(e=>{
      drawAlienRect(
        e.x, e.y, e.w, e.h, e.type,
        { t: nowMs(), px: player.x, py: player.y, hitFlash: (e._flashTimer||0) > 0 }
      );
    });
  }

  // Enemy bullets
  enemyBullets.forEach(b=>{
    ctx.fillStyle = COLORS.enemyBullet; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
  });

  // Player ship (pixel‑style vector)
  drawPlayer();

  // Player bullets
  bullets.forEach(b=>{
    ctx.fillStyle = b.color || COLORS.bullet; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
  });

  // Particles
  particles.forEach(p=>{
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life/800);
    ctx.fillRect(p.x, p.y, 2, 2);
    ctx.globalAlpha = 1;
  });

  ctx.fillStyle = 'rgba(229,231,235,.55)';
  ctx.font = `${Math.max(10, Math.floor(W*0.03))}px system-ui, sans-serif`;
  ctx.textAlign = 'right'; ctx.fillText(`🚀iGalaxy ${VERSION} • Skin: ${PLAYER_SKIN}`, W-8, H-6);
}

/* ===== Player Ship Renderer (pixel‑art style – 3 skins) ===== */
function drawPlayer(){
  const px = player.x, py = player.y;
  const t = nowMs();

  // i-frames blink
  let alpha = 1;
  if (t < player.invUntil){ alpha = (Math.floor(t/100) % 2) ? 0.35 : 1; }

  // Shield circle
  if (player.shieldUntil > t){
    ctx.strokeStyle = COLORS.shield; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py-2, 20, 0, Math.PI*2); ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(px, py);
  // scale theo chiều rộng khung — ~ “to hơn” khi W lớn
  const s = Math.min(1.3, Math.max(0.8, W/360)); // hệ số scale
  ctx.scale(s, s);
  ctx.translate(0, -6); // cân mắt

  // Thông số màu theo skin
  const skin = PLAYER_SKIN;
  let hullA='#1f2937', hullB='#374151', accent='#ef4444', accent2='#dc2626', fin='#111827', glow='#7dd3fc', nose='#60a5fa';
  if (skin==='Blue'){ accent='#1d4ed8'; accent2='#2563eb'; glow='#7dd3fc'; nose='#60a5fa'; }
  if (skin==='Green'){ accent='#22c55e'; accent2='#16a34a'; glow='#a7f3d0'; nose='#34d399'; }

  // Viền toàn tàu
  ctx.lineJoin='round'; ctx.lineCap='round'; ctx.strokeStyle='#0b1220'; ctx.lineWidth=2;

  // Cánh dọc (hai mé bên) – màu nhấn
  ctx.fillStyle = accent;
  path(()=>{ ctx.moveTo(-14,10); ctx.lineTo(-6,-10); ctx.lineTo(-4,-10); ctx.lineTo(-8,12); ctx.closePath(); });
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = accent2;
  path(()=>{ ctx.moveTo(14,10); ctx.lineTo(6,-10); ctx.lineTo(4,-10); ctx.lineTo(8,12); ctx.closePath(); });
  ctx.fill(); ctx.stroke();

  // Thân chính (giữa) – hai lớp
  ctx.fillStyle = hullA;
  path(()=>{ ctx.moveTo(0,-18); ctx.lineTo(-7,-6); ctx.lineTo(-6,12); ctx.lineTo(6,12); ctx.lineTo(7,-6); ctx.closePath(); });
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = hullB;
  path(()=>{ ctx.moveTo(0,-14); ctx.lineTo(-5,-4); ctx.lineTo(-4,10); ctx.lineTo(4,10); ctx.lineTo(5,-4); ctx.closePath(); });
  ctx.fill(); ctx.stroke();

  // Mũi tàu (nose cap)
  const ng = gradV(0,-18, 0,-6, nose, '#ffffff22');
  ctx.fillStyle = ng;
  path(()=>{ ctx.moveTo(0,-20); ctx.lineTo(-3,-14); ctx.lineTo(3,-14); ctx.closePath(); });
  ctx.fill(); ctx.stroke();

  // Buồng lái (canopy) – glow xanh
  const cg = gradR(0,-4, 2, glow, '#3b82f699');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.ellipse(0,-4, 6, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // Cánh dưới (fins)
  ctx.fillStyle = fin;
  path(()=>{ ctx.moveTo(-10,12); ctx.lineTo(-18,16); ctx.lineTo(-4,16); ctx.closePath(); });
  ctx.fill(); ctx.stroke();
  path(()=>{ ctx.moveTo(10,12); ctx.lineTo(18,16); ctx.lineTo(4,16); ctx.closePath(); });
  ctx.fill(); ctx.stroke();

  // Chi tiết điểm sáng
  ctx.fillStyle='#ffffffaa'; ctx.fillRect(-2,-2,1.5,1.5); ctx.fillRect(0,-8,1.2,1.2);

  // Drone “cánh phụ” khi có power
  if (player.droneUntil > t){
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(-16, 2, 3, 6); ctx.fillRect(13, 2, 3, 6);
  }

  // Lửa động cơ: khi bắn hoặc đang giữ phím di chuyển
  if (input.fire || input.left || input.right){
    const flick = 6 + Math.sin(t/40)*2;
    ctx.fillStyle = '#f59e0b';
    path(()=>{ ctx.moveTo(-3,16); ctx.lineTo(0,16+flick); ctx.lineTo(3,16); ctx.closePath(); });
    ctx.fill();
    ctx.fillStyle = '#facc15';
    path(()=>{ ctx.moveTo(-2,16); ctx.lineTo(0,16+flick*0.7); ctx.lineTo(2,16); ctx.closePath(); });
    ctx.fill();
  }

  ctx.restore();
}

/* Helpers cho vẽ tàu */
function path(drawer){ ctx.beginPath(); drawer(); }
function gradR(x,y,r,c1,c2){ const g=ctx.createRadialGradient(x,y,1,x,y,Math.max(8,r*6)); g.addColorStop(0,c1); g.addColorStop(1,c2); return g; }
function gradV(x0,y0,x1,y1,c1,c2){ const g=ctx.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,c1); g.addColorStop(1,c2); return g; }

/* ===== Helper path: roundRect không fill/stroke ngay ===== */
function roundRectPath(x,y,w,h,r){
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x,y,w,h,r);
  } else {
    const rr = Math.min(r, w/2, h/2);
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
  }
}

/* ===== Renderer: ENEMY UFO CYCLOPS ===== */
function drawAlienRect(x, y, w, h, kind, opts = {}) {
  const { t = nowMs(), px = null, py = null, blink = false, hitFlash = false } = opts;
  const pal = ['#7CFC00','#6ef78f','#52e2f5','#f5d352','#f58f52'];
  const body = pal[kind % pal.length];
  const dark = 'rgba(0,0,0,.18)';

  if (hitFlash){
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(x-2, y-2, w+4, h+4);
  }

  const r = Math.min(10, w*0.22);
  const baseY = y + h*0.38;
  const baseH = h*0.62;

  ctx.fillStyle = body; roundRectPath(x, baseY, w, baseH, r); ctx.fill();
  ctx.fillStyle = dark; roundRectPath(x+2, baseY+2, w-4, baseH-4, Math.max(2,r-2)); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; roundRectPath(x+4, baseY+4, w-8, Math.max(3, baseH*0.2), Math.max(2,r-3)); ctx.fill();

  const canopyW = w*0.76, canopyH = h*0.48;
  const canopyX = x + (w - canopyW)/2, canopyY = y;
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; roundRectPath(canopyX, canopyY, canopyW, canopyH, Math.min(10, w*0.25)); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRectPath(canopyX+4, canopyY+4, canopyW-8, Math.max(2, canopyH*0.22), Math.min(8, w*0.2)); ctx.fill();

  const lamps = 5;
  for (let i=0;i<lamps;i++){
    const lx = x + (i+0.5) * (w/lamps), ly = baseY + baseH*0.78;
    ctx.fillStyle = i%2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.arc(lx, ly, Math.max(2, w*0.03), 0, Math.PI*2); ctx.fill();
  }

  const blinkAuto = ((t % 2200) < 120);
  const isBlinking = blink || blinkAuto;

  const cx = x + w/2, cy = canopyY + canopyH*0.52;
  const eyeR = Math.max(6, Math.min(w,h) * 0.16);

  let lookDx = 0, lookDy = 0;
  if (px != null && py != null){
    const vx = px - cx, vy = py - cy, len = Math.hypot(vx,vy)||1;
    lookDx = (vx/len) * (eyeR * 0.35);
    lookDy = (vy/len) * (eyeR * 0.25);
  }

  ctx.fillStyle = '#ffffff';
  if (!isBlinking){ ctx.beginPath(); ctx.arc(cx, cy, eyeR, 0, Math.PI*2); ctx.fill(); }
  else { const th = Math.max(1, eyeR*0.35); ctx.fillRect(cx - eyeR, cy - th/2, eyeR*2, th); }

  if (!isBlinking){
    const pr = Math.max(2, eyeR*0.45);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(cx + lookDx*0.7, cy + lookDy*0.7, pr, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(cx - pr*0.4, cy - pr*0.35, pr*0.25, 0, Math.PI*2); ctx.fill();
  }
}

/* ===== Renderer: BOSS UFO “quỷ” ===== */
function drawBossScary(b, o = {}){
  const t = o.t ?? nowMs(), px = o.px ?? null, py = o.py ?? null;
  const hpRatio = Math.max(0, Math.min(1, o.hpRatio ?? 1));
  const hitFlash = !!o.hitFlash;

  const x=b.x, y=b.y, w=b.w, h=b.h, cx=x+w/2, cy=y+h/2;

  ctx.save();
  const pulse = 0.85 + 0.15 * Math.sin(t/280);
  const rg = ctx.createRadialGradient(cx, cy, Math.max(2,w*0.05), cx, cy, Math.max(w,h)*0.75);
  rg.addColorStop(0, `rgba(255, 80, 100, ${0.28*pulse})`);
  rg.addColorStop(1, 'rgba(255, 0, 40, 0)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(cx, cy, w*0.9, h*1.2, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#711925'; roundRectPath(x, y, w, h, Math.min(14, w*0.22)); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.22)'; roundRectPath(x+2, y+2, w-4, h-4, Math.min(12, w*0.2)); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRectPath(x+4, y+4, w-8, Math.max(3, h*0.28), Math.min(10, w*0.18)); ctx.fill();

  const spikes = 6; ctx.fillStyle = '#9b1c31';
  for (let i=0;i<spikes;i++){ const sx0 = x + (i+0.5) * (w/spikes), sTop = y - h*0.25;
    ctx.beginPath(); ctx.moveTo(sx0-6, y+4); ctx.lineTo(sx0+6, y+4); ctx.lineTo(sx0, sTop); ctx.closePath(); ctx.fill(); }

  const canopyW=w*0.76, canopyH=h*0.58, canopyX=x+(w-canopyW)/2, canopyY=y+h*0.02;
  ctx.fillStyle='rgba(255,255,255,0.16)'; roundRectPath(canopyX,canopyY,canopyW,canopyH,Math.min(12,w*0.26)); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.10)'; roundRectPath(canopyX+4,canopyY+4,canopyW-8,Math.max(2,canopyH*0.22),Math.min(10,w*0.22)); ctx.fill();

  const blinking = (t % 2500) < 140; const eyeR = Math.max(10, Math.min(w,h)*0.28);
  const eyeX = cx, eyeY = canopyY + canopyH*0.60;

  // Theo dõi người chơi
  let lookDx = 0, lookDy = 0;
  if (px != null && py != null){
    const vx = px - eyeX, vy = py - eyeY;
    const len = Math.hypot(vx, vy) || 1;
    lookDx = (vx/len) * (eyeR * 0.35);
    lookDy = (vy/len) * (eyeR * 0.25);
  }

  // Flash khi trúng đạn
  if (hitFlash){
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(x-3, y-3, w+6, h+6);
  }

  // Mắt lớn (blink)
  if (!blinking){
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI*2); ctx.fill();
  } else {
    const th = Math.max(2, eyeR*0.35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX - eyeR, eyeY - th/2, eyeR*2, th);
  }

  // Con ngươi
  if (!blinking){
    const pr = Math.max(3, eyeR*0.48);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(eyeX + lookDx*0.7, eyeY + lookDy*0.7, pr, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(eyeX - pr*0.35, eyeY - pr*0.35, pr*0.25, 0, Math.PI*2); ctx.fill();
  }

  // Thanh máu boss
  const barW = Math.max(60, w * 0.9);
  const barH = 6;
  const barX = cx - barW/2;
  const barY = y - 12;

  // viền
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRectPath(barX, barY, barW, barH, 3); ctx.fill();

  // máu
  const hpW = Math.max(0, barW * hpRatio);
  const hpGrad = ctx.createLinearGradient(barX, barY, barX + hpW, barY);
  hpGrad.addColorStop(0, '#22d3ee');
  hpGrad.addColorStop(0.5, '#facc15');
  hpGrad.addColorStop(1, '#f43f5e');
  ctx.fillStyle = hpGrad;
  roundRectPath(barX+1, barY+1, Math.max(0, hpW-2), barH-2, 3); ctx.fill();

  ctx.restore();
}
