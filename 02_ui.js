/* ===== UI ===== */
function updateHUD(){
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
  document.getElementById('best').textContent = best;
}
function resetBest(){
  localStorage.removeItem(LS_KEY_V2);
  best = 0; updateHUD();
}
