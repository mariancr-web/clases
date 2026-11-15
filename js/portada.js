import { cargarDatos, esc, tnum } from './comun.js';

const main = document.getElementById('cursos');
const F = '<svg class="ir" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const LIBRO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>';
const nTemas = c => c.temas.length + (c.web ? c.web.temas || 0 : 0);

try {
  const datos = await cargarDatos();
  // /2bach-quimica → solo ese curso
  const ruta = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)[0];
  const solo = ruta && datos.cursos.find(c => c.ruta === ruta);
  let cursos = datos.cursos;
  if (solo) {
    cursos = [solo];
    document.title = `${solo.etiqueta} · ${solo.materia} · mariancr`;
    document.body.className = document.body.className.replace(/\bcurso-\S+/g, '').trim() + ' curso-' + solo.curso;
    document.getElementById('ojo').innerHTML = `<a href="/">Clases</a> · ${esc(solo.nivel)}`;
    document.getElementById('titulo').textContent = solo.materia;
    const n = nTemas(solo);
    document.getElementById('lema').textContent = n ? `${n} tema${n === 1 ? '' : 's'} con apuntes, ejercicios y presentaciones.` : 'Muy pronto tendrás aquí los temas del curso.';
  }
  // Atajos de curso en el héroe
  document.getElementById('saltos').innerHTML = datos.cursos.map(c =>
    `<a class="salto curso-${c.curso}${solo === c ? ' activo' : ''}" href="/${c.ruta}"><img src="/img/simbolo-${c.curso}.svg" alt=""><span><b>${esc(c.etiqueta)}</b>${esc(c.materia)}</span></a>`).join('');

  const conTemas = cursos.filter(nTemas), sin = cursos.filter(c => !nTemas(c));
  // Cursos abiertos (se recuerdan en este navegador)
  const CLAVE = 'clases-abiertos';
  let abiertos = [];
  try { abiertos = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) {}
  main.innerHTML = conTemas.map(c => {
    const web = c.web ? `<a class="tarjeta tarjeta--web" href="${esc(c.web.url)}"><span class="tarjeta__num">★</span>
        <span class="tarjeta__txt"><b>${esc(c.web.nombre)}</b><small>${esc(c.web.texto)}</small></span><span class="tarjeta__pie">Abrir la web ${F}</span></a>` : '';
    const temas = c.temas.map(t => `<a class="tarjeta" href="/${c.ruta}/${tnum(t.numero)}"><span class="tarjeta__num">${t.numero}</span>
        <span class="tarjeta__txt"><b>${esc(t.titulo)}</b><small>${t.secciones.map(s => esc(s.titulo)).join(' · ')}</small></span>
        <span class="tarjeta__pie">${t.libro ? `<span class="libro">${LIBRO}Libro interactivo</span>` : ''}${F}</span></a>`).join('');
    return `<details class="curso curso-${c.curso}" id="${c.ruta}" data-ruta="${c.ruta}"${solo || abiertos.includes(c.ruta) ? ' open' : ''}>
      <summary class="curso__cab"><img src="/img/simbolo-${c.curso}.svg" alt="">
        <span><span class="curso__nivel">${esc(c.nivel)}</span><span class="curso__materia">${esc(c.materia)}</span></span>
        <span class="curso__n">${nTemas(c)} tema${nTemas(c) === 1 ? '' : 's'}</span><span class="curso__flecha" aria-hidden="true"></span></summary>
      <div class="tarjetas">${web}${temas}</div></details>`;
  }).join('') + (sin.length ? `<section class="pronto-cursos"><h2 class="mcr-seccion">Muy pronto</h2><div class="pronto-lista">${
    sin.map(c => `<div class="pronto-curso curso-${c.curso}"><img src="/img/simbolo-${c.curso}.svg" alt=""><span><b>${esc(c.etiqueta)}</b>${esc(c.materia)}</span><span class="pronto">Próximamente</span></div>`).join('')
  }</div></section>` : '');
  if (!solo) main.addEventListener('toggle', () => {
    const ab = [...main.querySelectorAll('details.curso[open]')].map(d => d.dataset.ruta);
    try { localStorage.setItem(CLAVE, JSON.stringify(ab)); } catch (e) {}
  }, true);
} catch (e) {
  main.innerHTML = '<p class="mcr-vacio">No se han podido cargar los cursos. Recarga la página.</p>';
}
