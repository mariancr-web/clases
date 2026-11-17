/* Flipbook de prueba · mariancr Clases
   Páginas = imágenes WebP del PDF (paginas/NN.webp, miniaturas mNN.webp).
   Efecto de pasar página: StPageFlip 2.0.7 (MIT, copia local en page-flip.browser.js).
   Enlaces del PDF (índice y actividades) = zonas pulsables encima de cada página (datos.js). */
(() => {
  const L = window.LIBRO, N = L.paginas, RATIO = L.ancho / L.alto;
  const $ = (id) => document.getElementById(id);
  const nn = (i) => String(i).padStart(2, '0');
  const src = (i) => `paginas/${nn(i)}.webp`;
  const mini = (i) => `paginas/m${nn(i)}.webp`;
  $('titulo').textContent = L.titulo;

  /* ---------- Páginas ---------- */
  const caja = $('libro'), imgs = [];
  for (let i = 1; i <= N; i++) {
    const pag = document.createElement('div');
    pag.className = 'fb-pag';
    if (i === 1 || i === N) pag.dataset.density = 'hard';
    const im = document.createElement('img');
    im.alt = `Página ${i}`; im.decoding = 'async'; im.draggable = false;
    im.src = mini(i); im.dataset.full = src(i);   // miniatura borrosa al principio, la buena al acercarse
    pag.appendChild(im); imgs.push(im);
    for (const e of L.enlaces.filter((e) => e.p === i)) {
      const a = document.createElement('a');
      a.className = 'fb-enlace' + (e.url ? ' fb-enlace--web' : '');
      Object.assign(a.style, { left: e.x + '%', top: e.y + '%', width: e.w + '%', height: e.h + '%' });
      if (e.url) { a.href = e.url; a.target = '_blank'; a.rel = 'noopener'; a.title = 'Abrir la actividad'; }
      else { a.href = '#p' + e.ir; a.title = 'Ir a la página ' + e.ir; a.addEventListener('click', (ev) => { ev.preventDefault(); ir(e.ir); }); }
      pag.appendChild(a);
    }
    caja.appendChild(pag);
  }
  const cargar = (p) => { // p = 1..N ; carga la imagen buena de p-3 … p+4
    for (let i = Math.max(1, p - 3); i <= Math.min(N, p + 4); i++) {
      const im = imgs[i - 1];
      if (im.dataset.full) { const f = im.dataset.full; delete im.dataset.full; const pre = new Image(); pre.onload = () => { im.src = f; }; pre.src = f; }
    }
  };

  /* ---------- Libro ---------- */
  const escena = $('escena');
  const quiereVertical = () => escena.clientWidth / escena.clientHeight < 1.05 || escena.clientWidth < 700;
  const minAncho = () => (quiereVertical() ? escena.clientWidth : 200);
  const inicio = Math.min(N, Math.max(1, parseInt((location.hash.match(/p(\d+)/) || [])[1] || '1', 10)));
  const pf = new St.PageFlip(caja, {
    width: L.ancho, height: L.alto, size: 'stretch',
    minWidth: minAncho(), maxWidth: 2000, minHeight: 200, maxHeight: 3000,
    showCover: true, usePortrait: true, mobileScrollSupport: false,
    maxShadowOpacity: 0.35, flippingTime: 650, startPage: inicio - 1,
    autoSize: true, clickEventForward: true, swipeDistance: 25,
  });
  pf.loadFromHTML(caja.querySelectorAll('.fb-pag'));

  const actual = () => pf.getCurrentPageIndex() + 1;
  const pintar = () => {
    const p = actual(), vert = pf.getOrientation() === 'portrait';
    let txt = String(p);
    if (!vert && p > 1 && p < N) { const a = p % 2 === 0 ? p : p - 1; txt = `${a}–${Math.min(N, a + 1)}`; }
    $('num').textContent = `${txt} / ${N}`;
    $('barra').value = p;
    $('b-ant').disabled = p <= 1; $('b-sig').disabled = p >= N;
    cargar(p);
    history.replaceState(null, '', '#p' + p);
    document.querySelectorAll('.fb-mini').forEach((m) => m.classList.toggle('es-actual', +m.dataset.p === p || (!vert && +m.dataset.p === p + 1 && p > 1)));
  };
  pf.on('flip', pintar);
  pf.on('changeOrientation', pintar);
  pf.on('init', pintar);
  pintar();

  const ir = (p) => {
    p = Math.min(N, Math.max(1, p));
    cargar(p);
    if (Math.abs(p - actual()) <= 2) pf.flip(p - 1); else pf.turnToPage(p - 1);
    setTimeout(pintar, 50);
  };

  // Cambiar entre una página (iPad en vertical, móvil) y doble página (iPad en horizontal, ordenador)
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { pf.getSettings().minWidth = minAncho(); pf.update(); pintar(); }, 120);
  });

  /* ---------- Controles ---------- */
  $('b-ant').onclick = () => pf.flipPrev();
  $('b-sig').onclick = () => pf.flipNext();
  const barra = $('barra'); barra.max = N;
  barra.oninput = () => { $('num').textContent = `${barra.value} / ${N}`; };
  barra.onchange = () => ir(+barra.value);
  document.addEventListener('keydown', (e) => {
    if (!$('lupa').hidden) { if (e.key === 'Escape') cerrarLupa(); else if (e.key === 'ArrowRight') lupaIr(1); else if (e.key === 'ArrowLeft') lupaIr(-1); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') pf.flipNext();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') pf.flipPrev();
    else if (e.key === 'Escape') cerrarPaneles();
  });

  // Índice
  const toc = $('toc');
  for (const [nivel, tit, p] of L.indice) {
    const li = document.createElement('li'); li.className = 'fb-toc__n' + nivel;
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<span></span><b>${p}</b>`; b.firstChild.textContent = tit;
    b.onclick = () => { cerrarPaneles(); ir(p); };
    li.appendChild(b); toc.appendChild(li);
  }
  // Miniaturas
  const minis = $('minis');
  for (let i = 1; i <= N; i++) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fb-mini'; b.dataset.p = i;
    b.innerHTML = `<img loading="lazy" alt="" src="${mini(i)}"><span>${i}</span>`;
    b.onclick = () => { cerrarPaneles(); ir(i); };
    minis.appendChild(b);
  }
  const paneles = { 'b-indice': 'p-indice', 'b-mini': 'p-mini' };
  const cerrarPaneles = () => { for (const [b, p] of Object.entries(paneles)) { $(p).hidden = true; $(b).setAttribute('aria-expanded', 'false'); } };
  for (const [b, p] of Object.entries(paneles)) {
    $(b).onclick = () => { const abrir = $(p).hidden; cerrarPaneles(); if (abrir) { $(p).hidden = false; $(b).setAttribute('aria-expanded', 'true'); pintar(); } };
  }
  document.querySelectorAll('[data-cierra]').forEach((x) => (x.onclick = cerrarPaneles));

  // Lupa: la página a todo lo ancho, con desplazamiento y pellizco del propio navegador
  let lp = 1;
  const lupaPintar = () => {
    $('l-num').textContent = `Página ${lp} de ${N}`;
    const hoja = $('l-hoja'); hoja.innerHTML = '';
    const im = new Image(); im.src = src(lp); im.alt = `Página ${lp}`; hoja.appendChild(im);
    for (const e of L.enlaces.filter((e) => e.p === lp)) {
      const a = document.createElement('a'); a.className = 'fb-enlace' + (e.url ? ' fb-enlace--web' : '');
      Object.assign(a.style, { left: e.x + '%', top: e.y + '%', width: e.w + '%', height: e.h + '%' });
      if (e.url) { a.href = e.url; a.target = '_blank'; a.rel = 'noopener'; }
      else { a.href = '#'; a.onclick = (ev) => { ev.preventDefault(); lp = e.ir; lupaPintar(); }; }
      hoja.appendChild(a);
    }
    $('l-scroll').scrollTop = 0;
    $('l-ant').disabled = lp <= 1; $('l-sig').disabled = lp >= N;
  };
  const lupaIr = (d) => { lp = Math.min(N, Math.max(1, lp + d)); lupaPintar(); };
  const cerrarLupa = () => { $('lupa').hidden = true; document.body.classList.remove('fb-sin-scroll'); ir(lp); };
  $('b-lupa').onclick = () => { cerrarPaneles(); lp = actual(); lupaPintar(); $('lupa').hidden = false; document.body.classList.add('fb-sin-scroll'); };
  $('l-ant').onclick = () => lupaIr(-1);
  $('l-sig').onclick = () => lupaIr(1);
  $('l-cerrar').onclick = cerrarLupa;

  // Pantalla completa (en iPad Safari no existe para páginas: se oculta el botón)
  const raiz = document.documentElement;
  if (!raiz.requestFullscreen && !raiz.webkitRequestFullscreen) $('b-pantalla').hidden = true;
  $('b-pantalla').onclick = () => {
    const dentro = document.fullscreenElement || document.webkitFullscreenElement;
    if (dentro) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (raiz.requestFullscreen || raiz.webkitRequestFullscreen).call(raiz);
  };
})();
