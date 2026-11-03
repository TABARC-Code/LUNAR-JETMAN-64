// Headless smoke test. Needs Node 18 or newer. Run from the project folder:  node tests/smoke.js
// It pulls the <script> out of index.html, stubs the canvas, and drives the game with fake key presses.
// It checks game logic only. It can't tell you whether anything looks right on screen.
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
const noop = () => {};

function makeGame() {
  const grad = { addColorStop: noop };
  const ctx = new Proxy({}, {
    get: (t, k) => (k in t ? t[k] : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => grad : noop),
    set: (t, k, v) => { t[k] = v; return true; }
  });
  const listeners = {};
  const sb = {
    raf: [], timers: [], clock: 0, ts: 1000,
    document: { getElementById: () => ({ getContext: () => ctx }) },
    window: { addEventListener: (n, f) => { (listeners[n] ||= []).push(f); } },
    console, Math, Uint16Array, Array, Number, String, Object, JSON
  };
  sb.requestAnimationFrame = f => { sb.raf.push(f); };
  sb.setTimeout = (f, ms) => { sb.timers.push({ at: sb.clock + ms, f }); return 0; };
  vm.createContext(sb);
  vm.runInContext(src + `\n;this.G = {
    get: () => ({ state, score, lives, level, enemies: enemies.length, pending: pendingSpawns, base: base ? base.hp : null, frame }),
    jm: () => jm, rover: () => rover, enemies: () => enemies, setBaseHp: v => { base.hp = v; } };`, sb);
  const g = { sb, errors: 0 };
  g.key = (type, code) => (listeners[type] || []).forEach(f => f({ code, preventDefault: noop }));
  g.frames = (n, hz = 60) => {
    for (let i = 0; i < n; i++) {
      sb.clock += 1000 / hz; sb.ts += 1000 / hz;
      const due = sb.timers.filter(t => t.at <= sb.clock); sb.timers = sb.timers.filter(t => t.at > sb.clock);
      due.forEach(t => { try { t.f(); } catch (e) { g.errors++; console.log('timer error:', e.message); } });
      const q = sb.raf; sb.raf = [];
      q.forEach(f => { try { f(sb.ts); } catch (e) { g.errors++; if (g.errors < 4) console.log('error:', e.stack.split('\n').slice(0, 3).join(' | ')); } });
    }
  };
  return g;
}

let failed = 0;
const ok = (name, cond) => { if (!cond) failed++; console.log((cond ? 'PASS' : 'FAIL') + '  ' + name); };

// Refresh-rate independence: ten seconds of wall time should give about 600 ticks at any rate.
for (const hz of [60, 144]) {
  const g = makeGame(); g.frames(hz * 10, hz);
  const f = g.sb.G.get().frame;
  ok(`${hz}Hz display gives about 600 ticks in 10s (got ${f})`, f >= 590 && f <= 610);
}

const g = makeGame();
g.frames(3);
g.key('keydown', 'Space'); g.key('keyup', 'Space');
ok('Space starts the game', g.sb.G.get().state === 'playing');
g.frames(300);
ok('still sector 1 after five seconds', g.sb.G.get().level === 1);
g.key('keydown', 'KeyP'); g.key('keyup', 'KeyP'); g.frames(2);
ok('P pauses', g.sb.G.get().state === 'paused');
g.key('keydown', 'KeyP'); g.key('keyup', 'KeyP'); g.frames(2);
ok('P resumes', g.sb.G.get().state === 'playing');

const jm = g.sb.G.jm(), rv = g.sb.G.rover();
jm.x = rv.x + rv.w / 2 - jm.w / 2; jm.y = rv.y - jm.h; jm.vy = 0; jm.invincible = 99999; g.frames(90);
g.key('keydown', 'KeyE'); g.key('keyup', 'KeyE'); g.frames(1);
ok('E boards the rover', g.sb.G.jm().inRover && g.sb.G.rover().hasJetman);
const x0 = g.sb.G.rover().x; g.key('keydown', 'ArrowRight'); g.frames(60); g.key('keyup', 'ArrowRight');
ok('rover drives right', g.sb.G.rover().x > x0 + 50);
g.key('keydown', 'KeyE'); g.key('keyup', 'KeyE'); g.frames(1);
ok('E gets Jetman back out', !g.sb.G.jm().inRover);

const j2 = g.sb.G.jm(); g.sb.G.enemies().length = 0;
const s0 = g.sb.G.get().score;
j2.y = 85; j2.vy = 0; j2.facing = 1;
g.sb.G.enemies().push({ type: 0, x: j2.x + 120, y: 95, vx: 0, vy: 0, w: 26, h: 13, hp: 1, maxHp: 1, timer: 0, pattern: 0, shootCd: 999, bombCd: 999, alive: true });
g.key('keydown', 'KeyZ'); g.frames(30); g.key('keyup', 'KeyZ');
ok('shooting a scout scores points', g.sb.G.get().score > s0);

g.sb.G.setBaseHp(0); g.frames(3);
ok('base at zero hit points ends the game', g.sb.G.get().state === 'gameover');
g.key('keydown', 'KeyR'); g.key('keyup', 'KeyR'); g.frames(2);
const r = g.sb.G.get();
ok('R restarts with 3 lives, sector 1, full base', r.state === 'playing' && r.lives === 3 && r.level === 1 && r.base === 10);

ok('no runtime errors', g.errors === 0);
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
