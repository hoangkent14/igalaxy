
/* ===== Random-Fall Spawner with 180s Boss (Monkey Patch, no wave edits) ===== */
(function(){
  // --- Globals for scaling ---
  let bossKillCount = 0;
  let enemyHpMul = 1.0;                 // multiplier for spawned enemies HP
  const ENEMY_HP_PER_BOSS = 0.25;       // +25% HP per boss kill

  // Boss schedule based on last death
  let lastBossDeathAt = 0;              // ms (performance.now())
  let nextBossAt = 0;                   // ms

  // Spawner state
  const spawner = {
    running: false,
    tAccum: 0,
    spawnRate: 1200,        // ms – base interval
    spawnRateMin: 450,      // ms – floor
    rampEvery: 8000,        // ms – every 8s reduce interval by rampDelta
    rampDelta: 40,
    rampAccum: 0,
    maxEnemiesOnScreen: 32,
  };

  function startSpawner(){
    spawner.running = true;
    spawner.tAccum = 0; spawner.rampAccum = 0;
    lastBossDeathAt = performance.now();
    nextBossAt = lastBossDeathAt + 180000; // 180s
  }
  function stopSpawner(){ spawner.running = false; }

  function choiceWeighted(items){
    const tot = items.reduce((s,it)=>s+it.w,0);
    let r = Math.random()*tot;
    for (const it of items){ r -= it.w; if (r<=0) return it.v; }
    return items[items.length-1].v;
  }

  function spawnEnemyRandom(){
    if (boss) return; // pause during boss
    if (enemies.length >= spawner.maxEnemiesOnScreen) return;

    const kind = choiceWeighted([
      {v:0, w:4}, // use original type=0 (sin x)
      {v:1, w:3}, // type=1 (sin x + drift down)
      {v:2, w:2}, // type=2 (zigzag x with walls)
      {v:3, w:1}, // type=3 (chase)
    ]);

    // size similar to wave enemy
    const col = 7, gapX = 18; const gridW = W - 40; const ew = Math.floor((gridW - (col-1)*gapX)/col); const eh = 100;
    const x = 20 + Math.random()*(W - 40 - ew); const y = -eh + 12;

    const baseHP = ENEMY.baseHP * (kind===2?1.6:1.0);
    const hp = Math.max(1, Math.round(baseHP * enemyHpMul * (1 + Math.min(0.6, score/3000))));
    const speed = ENEMY.baseSpeed + 80 + Math.random()*50;
    const fireRate = Math.max(900, 3200 + (Math.random()*1200) - score*0.25);

    enemies.push({
      x, y, w: ew, h: eh, type: kind, hp,
      baseX:x, baseY:y, t:0, speed,
      fireCd: rand(400, fireRate),
      _flashTimer:0
    });
  }

  function updateSpawner(dt){
    if (!spawner.running) return;

    // 180s boss since last death
    if (!boss && performance.now() >= nextBossAt){
      enemies.length = 0;
      boss = { x: W/2 - 55, y: 60, w: 110, h: 40, hp: BOSS.hpBase + Math.max(0, 40* bossKillCount), vx: 70, vy: 0, fireCd: 600, phase: 0, _flashTimer: 0 };
    }

    // small enemies cadence
    spawner.tAccum += dt*1000;
    if (spawner.tAccum >= spawner.spawnRate){ spawner.tAccum -= spawner.spawnRate; spawnEnemyRandom(); }

    // ramp spawn frequency
    spawner.rampAccum += dt*1000;
    if (spawner.rampAccum >= spawner.rampEvery){ spawner.rampAccum = 0; spawner.spawnRate = Math.max(spawner.spawnRateMin, spawner.spawnRate - spawner.rampDelta); }
  }

  // --- Monkey patches ---
  // 1) Disable waves entirely
  const __origSpawnWave = window.spawnWave;
  window.spawnWave = function(n){ /* randomfall: disable waves */ };

  // 2) Start/Stop spawner with game lifecycle
  const __origGameOver = window.gameOver;
  window.gameOver = function(){ try{ stopSpawner(); }catch(e){}; return __origGameOver.apply(this, arguments); };

  // 3) Wrap update to inject spawner & detect boss death
  const __origUpdate = window.update;
  window.update = function(dt){
    if (running && !spawner.running) startSpawner();

    const hadBoss = !!boss;
    updateSpawner(dt);

    const ret = __origUpdate.apply(this, arguments);

    if (hadBoss && !boss){
      // Boss has died in this tick: ramp HP and schedule next boss
      bossKillCount++;
      enemyHpMul = 1.0 + ENEMY_HP_PER_BOSS * bossKillCount;
      lastBossDeathAt = performance.now();
      nextBossAt = lastBossDeathAt + 180000;
    }
    return ret;
  };
})();
