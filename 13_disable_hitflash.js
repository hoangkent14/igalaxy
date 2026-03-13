// ==== Disable hit-flash overlay for enemies & boss (non-destructive) ====
(function(){
  // Enemy: override drawAlienRect to bỏ qua lớp flash
  const __origDrawAlienRect = drawAlienRect;
  drawAlienRect = function(x, y, w, h, kind, opts = {}){
    // ép hitFlash = false
    const cleanOpts = Object.assign({}, opts, { hitFlash: false });
    return __origDrawAlienRect(x, y, w, h, kind, cleanOpts);
  };

  // Boss: override drawBossScary tương tự
  const __origDrawBoss = drawBossScary;
  drawBossScary = function(b, o = {}){
    const cleanO = Object.assign({}, o, { hitFlash: false });
    return __origDrawBoss(b, cleanO);
  };
})();
