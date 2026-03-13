/* ===== Loop, Game State & Overlay ===== */
function loop(ts){
  if (!running || paused) { draw(); return; }

  const dtSec = Math.min(0.033, (ts - lastTime) / 1000 || 0); // clamp 30ms để ổn định
  lastTime = ts;
  acc += dtSec;

  // update theo step mượt (sub-steps nếu cần)
  while (acc >= (stepMs / 1000)){
    update(stepMs / 1000);
    acc -= (stepMs / 1000);
  }

  draw();
  requestAnimationFrame(loop);
}

function toggleGame(){
  const ov = document.getElementById('overlay');
  if (!running){
    // Luôn reset state trước khi bắt đầu một run mới
    init();
    running = true;
    paused = false;
    ov.classList.add('hidden');
    lastTime = performance.now();
    requestAnimationFrame(loop);
    return;
  }
  // đang chạy -> tạm dừng / tiếp tục
  paused = !paused;
  if (paused){
    ov.classList.remove('hidden');
    document.getElementById('title').textContent = 'Tạm dừng';
    document.getElementById('desc').textContent  = 'Space chạm nhanh: Resume • Giữ Space: bắn • Kéo/Chạm để di chuyển';
  } else {
    ov.classList.add('hidden');
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function gameOver(){
  running = false; paused = false; lost = true;

  // lưu best
  best = Math.max(best, score);
  try { localStorage.setItem(LS_KEY_V2, String(best)); } catch(e){}

  updateHUD();
  const ov = document.getElementById('overlay');
  ov.classList.remove('hidden');
  document.getElementById('title').textContent = 'GAMEOVER 😵';
  document.getElementById('desc').textContent  = `Điểm: ${score} • Kỷ lục: ${best} — Bấm BẮT ĐẦU để chơi lại`;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // căn player trong khung mới
  player.x = clamp(player.x, 20, W-20);
  draw();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && running && !paused){
    // auto pause khi chuyển tab
    toggleGame();
  }
});

/* ===== Khởi động ===== */
init();

// Hỗ trợ chạm ngắn Space trên mobile: chạm vào canvas để toggle hoặc bắt đầu
board.addEventListener('click', (e) => {
  const ov = document.getElementById('overlay');
  if (!running){
    init(); // đảm bảo reset trước khi bắt đầu
    ov.classList.add('hidden');
    running = true; paused = false;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  } else {
    // khi đang chạy: click không làm gì để tránh pause nhầm
  }
});
