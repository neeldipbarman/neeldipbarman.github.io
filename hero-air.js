/* Hero aerosols drifting on a gentle, wavy breeze:
   black carbon  - dark fractal chains of tiny spherules
   brown carbon  - amber "tar ball" spheres
   dust          - larger angular tan grains that tumble slowly
   sulfate       - small light droplets with a faint rim
   sea salt      - small white cubic crystals
   Pauses off-screen, respects reduced motion, visitor can pause. */
(function () {
var tries = 0;
function start() {
  var hero = document.getElementById('top');
  if (!hero) { if (++tries < 150) setTimeout(start, 100); return; }
  if (hero.querySelector('.hero-air')) return;
  var c = document.createElement('canvas'); c.className = 'hero-air'; c.setAttribute('aria-hidden', 'true');
  hero.insertBefore(c, hero.firstChild);
  var bar = document.createElement('div'); bar.className = 'air-bar';
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'air-toggle';
  bar.appendChild(btn); hero.appendChild(bar);
  var ctx = c.getContext('2d'), W = 0, H = 0, P = [], HZ = [], t = 0, raf = 0, visible = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduce, R = Math.random;
  function label() { btn.textContent = paused ? 'Play motion' : 'Pause motion'; }
  var TYPES = [['bc', .27], ['brc', .17], ['dust', .16], ['so4', .27], ['salt', .13]];
  function pick() { var u = R(), a = 0; for (var i = 0; i < TYPES.length; i++) { a += TYPES[i][1]; if (u < a) return TYPES[i][0]; } return 'so4'; }
  function mk(anywhere) {
    var k = pick(), p = { k: k, x: anywhere ? R() * W : -20, y: R() * H, ph: R() * 6.283, rot: R() * 6.283, vr: (R() - .5) * .01 };
    if (k === 'bc') {            // random-walk chain of spherules
      // compact, branching aggregate: each spherule touches a random earlier one
      p.s = .3 + R() * .45; p.a = .6 + R() * .25; var n = 6 + (R() * 9 | 0), r0 = 1.0 + R() * .45;
      p.pts = [[0, 0]]; for (var i = 1; i < n; i++) { var b = p.pts[(R() * p.pts.length) | 0], ang = R() * 6.283;
        p.pts.push([b[0] + Math.cos(ang) * r0 * 1.8, b[1] + Math.sin(ang) * r0 * 1.8]); }
      p.r = r0; p.vr = (R() - .5) * .006;
    } else if (k === 'brc') { p.s = .28 + R() * .45; p.r = 1.6 + R() * 1.6; p.a = .5 + R() * .3; }
    else if (k === 'dust') {      // irregular polygon grain
      p.s = .16 + R() * .25; p.a = .55 + R() * .25; var m = 5 + (R() * 3 | 0), rr = 2.6 + R() * 3.2;
      p.pts = []; for (var j = 0; j < m; j++) { var th = j / m * 6.283 + (R() - .5) * .5, q = rr * (.65 + R() * .5); p.pts.push([Math.cos(th) * q, Math.sin(th) * q]); }
      p.vr = (R() - .5) * .02;
    } else if (k === 'so4') { p.s = .35 + R() * .5; p.r = 1.3 + R() * 1.7; p.a = .7 + R() * .25; }
    else { p.s = .3 + R() * .45; p.r = 1.4 + R() * 1.3; p.a = .7 + R() * .25; p.vr = (R() - .5) * .015; }
    return p;
  }
  function size() {
    var r = hero.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.max(55, Math.min(150, W * H / 8500)));
    P = []; for (var i = 0; i < n; i++) P.push(mk(true));
    HZ = [0, 1, 2].map(function (k) { return { x: W * (.2 + .3 * k), y: H * (.3 + .2 * k), r: Math.max(W, H) * (.22 + .06 * k), s: .06 + .03 * k }; });
    draw(false);
  }
  function shape(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.a;
    if (p.k === 'bc') { ctx.fillStyle = '#1E1F22'; for (var i = 0; i < p.pts.length; i++) { ctx.beginPath(); ctx.arc(p.pts[i][0], p.pts[i][1], p.r, 0, 6.283); ctx.fill(); } }
    else if (p.k === 'brc') { var g = ctx.createRadialGradient(-p.r * .35, -p.r * .35, 0, 0, 0, p.r); g.addColorStop(0, '#B07A3E'); g.addColorStop(1, '#6E4520');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283); ctx.fill(); }
    else if (p.k === 'dust') { ctx.fillStyle = '#C29A62'; ctx.strokeStyle = 'rgba(120,88,50,.5)'; ctx.lineWidth = .6; ctx.beginPath();
      for (var j = 0; j < p.pts.length; j++) ctx[j ? 'lineTo' : 'moveTo'](p.pts[j][0], p.pts[j][1]); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (p.k === 'so4') { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.strokeStyle = 'rgba(38,63,90,.5)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(95,135,160,.8)'; ctx.lineWidth = .8; var s = p.r * 1.6;
      ctx.fillRect(-s / 2, -s / 2, s, s); ctx.strokeRect(-s / 2, -s / 2, s, s); }
    ctx.restore();
  }
  function draw(move) {
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < HZ.length; k++) {
      var h = HZ[k]; if (move) { h.x += h.s; if (h.x - h.r > W) h.x = -h.r; }
      var g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      g.addColorStop(0, 'rgba(38,63,90,0.07)'); g.addColorStop(1, 'rgba(38,63,90,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (move) {
        var gust = 1 + .35 * Math.sin(t * .00025 + p.ph * .2);
        p.x += p.s * gust; p.y += Math.sin(p.x * .006 + t * .0006 + p.ph) * .32 * p.s; p.rot += p.vr;
        if (p.x > W + 20 || p.y < -20 || p.y > H + 20) P[i] = p = mk(false);
      }
      shape(p);
    }
  }
  function loop(ts) { raf = 0; if (paused || !visible || document.hidden) return; t = ts; draw(true); raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && !paused && visible && !document.hidden) raf = requestAnimationFrame(loop); }
  btn.addEventListener('click', function () { paused = !paused; label(); kick(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  label(); size(); kick();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
