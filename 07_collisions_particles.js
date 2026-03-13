/* ===== Collisions & Particles ===== */
function boom(x,y,color,count=16,sp=160){
  for (let i=0;i<count;i++){
    const a = Math.random()*Math.PI*2;
    const v = sp * (0.4+Math.random()*0.6);
    particles.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 500+Math.random()*500, color });
  }
}
function circleRectCollide(cx,cy,cr, rx,ry,rw,rh){
  const nx = clamp(cx, rx, rx+rw);
  const ny = clamp(cy, ry, ry+rh);
  const dx = cx - nx, dy = cy - ny;
  return dx*dx + dy*dy <= cr*cr;
}
