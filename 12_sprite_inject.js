// ======== SPRITE INJECT v4 (safe, non-blocking; player+enemy+boss) ========
(function(){
  const ASSETS = {
    player: { Blue: 'assets/player.png', Red: 'assets/player-1.png', Green: 'assets/player-2.png' },
    enemy: [
      'assets/enemy-0.png',
      'assets/enemy-1.png',
      'assets/enemy-2.png',
      'assets/enemy-3.png'
    ],
    boss: 'assets/boss.png'
  };
  const SPRITES = { player: {}, enemy: [], boss: null };

  function loadImage(src){
    return new Promise((res, rej)=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=()=>res(null); img.src=src; });
  }

  // preload in background (non-blocking)
  (async ()=>{
    try{
      for (const skin of Object.keys(ASSETS.player)){
        SPRITES.player[skin] = await loadImage(ASSETS.player[skin]);
      }
      for (let i=0;i<ASSETS.enemy.length;i++){
        SPRITES.enemy[i] = await loadImage(ASSETS.enemy[i]);
      }
      SPRITES.boss = await loadImage(ASSETS.boss);
    }catch(e){}
  })();

  // ---- hook: player ----
  const __origDrawPlayer = drawPlayer;
  drawPlayer = function(){
    const t = performance.now();
    const px = player.x, py = player.y;
    let alpha = 1; if (t < player.invUntil){ alpha = (Math.floor(t/100)%2)?0.35:1; }
    if (player.shieldUntil > t){ ctx.strokeStyle = COLORS.shield; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py-2, 20, 0, Math.PI*2); ctx.stroke(); }
    const img = SPRITES.player[PLAYER_SKIN];
    if (!img){ return __origDrawPlayer(); }
    const drawW = player.w * 2.4, drawH = player.h * 2.4;
    const dx = px - drawW/2, dy = py - drawH/2;
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(img, dx, dy, drawW, drawH); ctx.restore();
    if (input.fire || input.left || input.right){
      const flick = 6 + Math.sin(t/40)*2;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(px-3, py+16); ctx.lineTo(px, py+16+flick); ctx.lineTo(px+3, py+16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(px-2, py+16); ctx.lineTo(px, py+16+flick*0.7); ctx.lineTo(px+2, py+16); ctx.closePath(); ctx.fill();
    }
  };

  // ---- hook: enemy ----
  const __origDrawAlienRect = drawAlienRect;
  drawAlienRect = function(x, y, w, h, kind, opts = {}){
    const img = SPRITES.enemy[kind % SPRITES.enemy.length];
    if (!img){ return __origDrawAlienRect(x, y, w, h, kind, opts); }
    // hit flash overlay (giữ hiệu ứng)
    if (opts && opts.hitFlash){ ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.fillRect(x-2, y-2, w+4, h+4); }
    ctx.drawImage(img, x, y, w, h);
  };

  // ---- hook: boss ----
  const __origDrawBoss = drawBossScary;
  drawBossScary = function(b, o={}){
    const img = SPRITES.boss;
    if (!img){ return __origDrawBoss(b, o); }
    ctx.drawImage(img, b.x, b.y, b.w, b.h);
    // flash khi trúng đạn
    if (o && o.hitFlash){ ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.fillRect(b.x-3, b.y-3, b.w+6, b.h+6); }
    // thanh máu giữ nguyên (dùng lại đoạn từ hàm gốc rút gọn)
    const bossMaxHp = 60 + (Math.floor(level/5)-1)*40;
    const hpRatio = Math.max(0, b.hp / bossMaxHp);
    const cx = b.x + b.w/2; const barW = Math.max(60, b.w*0.9); const barH = 6; const barX = cx - barW/2; const barY = b.y - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; if (ctx.roundRect){ ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 3); ctx.fill(); } else { ctx.fillRect(barX, barY, barW, barH); }
    const hpW = Math.max(0, barW * hpRatio);
    const hpGrad = ctx.createLinearGradient(barX, barY, barX + hpW, barY);
    hpGrad.addColorStop(0, '#22d3ee'); hpGrad.addColorStop(0.5, '#facc15'); hpGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = hpGrad; if (ctx.roundRect){ ctx.beginPath(); ctx.roundRect(barX+1, barY+1, Math.max(0, hpW-2), barH-2, 3); ctx.fill(); } else { ctx.fillRect(barX+1, barY+1, Math.max(0, hpW-2), barH-2); }
  };
})();
// ======== END SPRITE INJECT v4 ========
