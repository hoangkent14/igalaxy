function hitPlayer(skipExplosion=false){
  const t = nowMs();
  if (t < player.invUntil) return;

  if (player.shieldUntil > t){
    boom(player.x, player.y-8, COLORS.shield, 16, 200);
    player.shieldUntil = 0;
    navigator.vibrate?.(40);
    return;
  }
  if (!skipExplosion) boom(player.x, player.y-8, '#f87171', 20, 240);

  navigator.vibrate?.([30, 30]);

  lives--; updateHUD();
  if (lives <= 0){ gameOver(); return; }

  player.x = W/2; player.y = H - 60;
  player.cooldown = 400;
  player.invUntil = nowMs() + PLAYER.iFrame;
  enemyBullets = enemyBullets.filter(b => b.y < H*0.7);
}
