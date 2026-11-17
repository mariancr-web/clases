import { cargarDatos, buscarTema, esc, tnum, ponerCurso, error, drive, ACTIVIDADES } from './comun.js';

const main = document.getElementById('contenido');
const cab = document.getElementById('cab');
const svg = (d, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  libro: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7h8M8 11h6"/>',
  teoria: '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
  ejercicios: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  presentacion: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  otro: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/>',
  actividades: '<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3M7.5 15h9"/>',
  ver: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bajar: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  ir: '<path d="M5 12h14M13 6l6 6-6 6"/>', volver: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
};
const icoSec = t => { const k = t.toLowerCase(); return k.startsWith('teor') ? I.teoria : k.startsWith('ejer') ? I.ejercicios : k.startsWith('presen') ? I.presentacion : I.otro; };

try {
  const datos = await cargarDatos();
  const { curso, tema } = buscarTema(datos);
  if (!tema) throw new Error('no');
  ponerCurso(curso.curso);
  document.title = `${tema.numero} · ${tema.titulo} · ${curso.etiqueta} · mariancr`;
  const i = curso.temas.indexOf(tema), ant = curso.temas[i - 1], sig = curso.temas[i + 1];
  const url = t => `/${curso.ruta}/${tnum(t.numero)}`;
  const nMat = tema.secciones.reduce((n, s) => n + s.materiales.filter(m => m.drive).length, 0);

  cab.innerHTML = `<div class="migas"><a href="/">Clases</a> / <a href="/${curso.ruta}">${esc(curso.etiqueta)} · ${esc(curso.materia)}</a> / <b>Tema ${tema.numero}</b></div>
    <div class="tema-titulo"><span class="tema-num">${tema.numero}</span>
      <div><div class="ojo">Tema ${tema.numero} · ${nMat} materiales</div><h1>${esc(tema.titulo)}</h1></div></div>
    <div class="heroe__acc">
      ${tema.actividades ? `<a class="mcr-btn" href="${ACTIVIDADES}?t=${encodeURIComponent(tema.actividades)}">${svg(I.actividades)}Actividades</a>` : ''}
    </div>`;

  const libro = tema.libro ? `<a class="libro-destacado" href="${url(tema)}/libro">
      <span class="libro-destacado__ico">${svg(I.libro)}</span>
      <span class="libro-destacado__txt"><span class="ojo">Libro interactivo</span><b>Lee el tema en la web</b>
        <small>Los apuntes completos, por apartados, con las actividades dentro de cada recuadro.</small></span>
      <span class="libro-destacado__btn">Abrir ${svg(I.ir)}</span></a>` : '';

  main.innerHTML = libro + tema.secciones.map(s => `<section class="grupo-tema">
      <h2 class="grupo-tema__tit"><span class="grupo-tema__ico">${svg(icoSec(s.titulo))}</span>${esc(s.titulo)}<small>${s.materiales.length}</small></h2>
      <div class="pdfs">${s.materiales.map(m => {
        const tit = m.titulo + (m.sub ? ' · ' + m.sub : '');
        return m.drive
          ? `<div class="pdf-tarjeta"><button class="pdf-tarjeta__abrir" type="button" data-drive="${esc(m.drive)}" data-sec="${esc(s.titulo)}" data-tit="${esc(tit)}">
               <span class="pdf-tarjeta__doc">PDF</span><span class="pdf-tarjeta__txt"><b>${esc(m.titulo)}</b>${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</span>
               <span class="pdf-tarjeta__ver">${svg(I.ver)}Ver</span></button>
             <a class="pdf-tarjeta__bajar" href="${drive.descarga(m.drive)}" title="Descargar ${esc(tit)}" aria-label="Descargar ${esc(tit)}">${svg(I.bajar)}</a></div>`
          : `<div class="pdf-tarjeta pdf-tarjeta--pronto"><span class="pdf-tarjeta__abrir"><span class="pdf-tarjeta__doc">PDF</span>
               <span class="pdf-tarjeta__txt"><b>${esc(m.titulo)}</b><small>${m.sub ? esc(m.sub) + ' · ' : ''}Próximamente</small></span></span></div>`;
      }).join('')}</div></section>`).join('')
    + `<nav class="pasar-tema" aria-label="Otros temas">
        ${ant ? `<a href="${url(ant)}">${svg(I.volver)}<span><small>Tema ${ant.numero}</small>${esc(ant.titulo)}</span></a>` : '<span></span>'}
        ${sig ? `<a class="sig" href="${url(sig)}"><span><small>Tema ${sig.numero}</small>${esc(sig.titulo)}</span>${svg(I.ir)}</a>` : `<a class="sig" href="/${curso.ruta}"><span><small>${esc(curso.etiqueta)}</small>Todos los temas</span>${svg(I.ir)}</a>`}
      </nav>`;

  const visor = document.getElementById('visor'), marco = document.getElementById('visor-marco');
  let origen = null;
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-drive]'); if (!b) return;
    origen = b; const id = b.dataset.drive;
    document.getElementById('visor-sec').textContent = b.dataset.sec;
    document.getElementById('visor-titulo').textContent = b.dataset.tit;
    document.getElementById('visor-pestana').href = drive.pestana(id);
    document.getElementById('visor-descarga').href = drive.descarga(id);
    marco.src = drive.vista(id);
    visor.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('visor-cerrar').focus();
  });
  const cerrar = () => { visor.hidden = true; marco.src = 'about:blank'; document.body.style.overflow = ''; origen?.focus(); };
  document.getElementById('visor-cerrar').addEventListener('click', cerrar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !visor.hidden) cerrar(); });
} catch (e) {
  error(main, 'Este tema no existe o todavía no está publicado.');
}
