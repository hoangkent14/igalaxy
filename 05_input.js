/* ===== Input (Keyboard + Mouse Drag + Touch) ===== */
const SIDE_MARGIN = 20, TOP_BOUND = 250, BOTTOM_MARGIN = 20;
window.addEventListener('keydown', e=>{
  const keysToBlock = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S',' ','1','2','3','r','R'];
  if (keysToBlock.includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
  if (e.key === 'ArrowRight'|| e.key === 'd' || e.key === 'D') input.right = true;
  if (e.key === 'ArrowUp'   || e.key === 'w' || e.key === 'W') input.up = true;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = true;
  if (e.key === '1'){ PLAYER_SKIN = 'Blue';  localStorage.setItem(LS_SKIN, PLAYER_SKIN); }
  if (e.key === '2'){ PLAYER_SKIN = 'Red';   localStorage.setItem(LS_SKIN, PLAYER_SKIN); }
  if (e.key === '3'){ PLAYER_SKIN = 'Green'; localStorage.setItem(LS_SKIN, PLAYER_SKIN); }
  if (e.key === 'r' || e.key === 'R'){ startRun(); }
  if (e.code === 'Space' && !e.repeat){ spaceDownAt = nowMs(); input.fire = true; }
});
window.addEventListener('keyup', e=>{
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
  if (e.key === 'ArrowRight'|| e.key === 'd' || e.key === 'D') input.right = false;
  if (e.key === 'ArrowUp'   || e.key === 'w' || e.key === 'W') input.up = false;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = false;
  if (e.code === 'Space'){
    input.fire = false;
    const held = nowMs() - spaceDownAt;
    if (held < 180){
      if (lost || !running){ // nếu vừa game over, Space ngắn sẽ START lại
        startRun();
      } else {
        togglePause();
      }
    }
  }
});

// ===== Mouse & Touch Drag with offset (no teleport) =====
let dragActive = false;
let dragDX = 0, dragDY = 0;     // offset giữa tâm tàu và con trỏ lúc bắt đầu kéo
let smoothFollow = false;       // bật mượt hoá nếu muốn
const FOLLOW_ALPHA = 0.35;      // hệ số lerp (0.2–0.5 tuỳ cảm giác)

// Helper: clamp player to bounds
function clampPlayerToBounds(nx, ny){
  const halfW = (player?.w || PLAYER.w) / 2;
  const halfH = (player?.h || PLAYER.h) / 2;
  const cx = clamp(nx, SIDE_MARGIN + halfW, W - SIDE_MARGIN - halfW);
  const cy = clamp(ny, TOP_BOUND + halfH,   H - BOTTOM_MARGIN - halfH);
  return { cx, cy };
}

// ---- Mouse ----
board.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;

  const rect = board.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Gắn cờ kéo, bắn
  dragActive = true;
  input.dragging = true;
  input.fire = true;

  // TÍNH OFFSET: tâm tàu - con trỏ
  dragDX = player.x - x;
  dragDY = player.y - y;

  // KHÔNG đặt lại vị trí ngay để tránh “teleport”
  // (tuỳ chọn) nếu muốn “bắt” ngay, bật smoothFollow = true để mượt
  smoothFollow = true;
});

board.addEventListener('mousemove', (e) => {
  if (!dragActive) return;
  const rect = board.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const targetX = x + dragDX;
  const targetY = y + dragDY;
  const { cx, cy } = clampPlayerToBounds(targetX, targetY);

  if (smoothFollow) {
    player.x += (cx - player.x) * FOLLOW_ALPHA;
    player.y += (cy - player.y) * FOLLOW_ALPHA;
  } else {
    player.x = cx; player.y = cy;
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button !== 0) return;
  dragActive = false;
  input.dragging = false;
  input.fire = false;
  smoothFollow = false;
});

// ---- Touch ----
board.addEventListener('touchstart', (e) => {
  const t = e.touches[0]; if (!t) return;

  const rect = board.getBoundingClientRect();
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;

  input.dragging = true;
  input.fire = true;
  dragActive = true;

  // TÍNH OFFSET lúc bắt đầu chạm
  dragDX = player.x - x;
  dragDY = player.y - y;

  // Không dời vị trí ngay; dùng offset ở touchmove
  smoothFollow = true;

  e.preventDefault();
}, { passive: false });

board.addEventListener('touchmove', (e) => {
  if (!input.dragging) return;
  const t = e.touches[0]; if (!t) return;

  const rect = board.getBoundingClientRect();
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;

  const targetX = x + dragDX;
  const targetY = y + dragDY;
  const { cx, cy } = clampPlayerToBounds(targetX, targetY);

  if (smoothFollow) {
    player.x += (cx - player.x) * FOLLOW_ALPHA;
    player.y += (cy - player.y) * FOLLOW_ALPHA;
  } else {
    player.x = cx; player.y = cy;
  }

  e.preventDefault();
}, { passive: false });

board.addEventListener('touchend', () => {
  input.dragging = false;
  input.fire = false;
  dragActive = false;
  smoothFollow = false;
});
