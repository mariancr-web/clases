import { cargarDatos, esc, tnum } from './comun.js';

const lista = document.getElementById('cursos');
try {
  const datos = await cargarDatos();
  // /2bach-quimica → solo ese curso
  const ruta = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)[0];
  const solo = ruta && datos.cursos.find(c => c.ruta === ruta);
  if (solo) {
    datos.cursos = [solo];
    document.title = `${solo.etiqueta} · ${solo.materia} · mariancr`;
    document.getElementById('tit-materias').textContent = `${solo.etiqueta} · ${solo.materia}`;
    document.body.className = document.body.className.replace(/\bcurso-\S+/g, '').trim() + ' curso-' + solo.curso;
  }
  lista.innerHTML = datos.cursos.map(c => {
    const n = c.temas.length + (c.web ? 1 : 0);
    const nt = c.temas.length + (c.web ? c.web.temas || 0 : 0);
    const estado = n ? `<span class="chip-temas">${nt} tema${nt === 1 ? '' : 's'}</span>` : '<span class="pronto">Próximamente</span>';
    const web = c.web ? `<li class="web-curso"><a href="${esc(c.web.url)}"><b>★</b><span><strong>${esc(c.web.nombre)}</strong><small>${esc(c.web.texto)}</small></span><em>Abrir la web →</em></a></li>` : '';
    const temas = n
      ? web + c.temas.map(t => `<li><a href="/${c.ruta}/${tnum(t.numero)}"><b>${t.numero}</b>${esc(t.titulo)}</a></li>`).join('')
      : '<li class="vacio">Aún no hay temas publicados.</li>';
    return `<li><details class="curso-fila curso-${c.curso}"${n ? ' open' : ''}>
      <summary data-tab="${esc(c.etiqueta)}"><img class="curso-fila__ico" src="/img/simbolo-${c.curso}.svg" alt="">
        <div><div class="curso-fila__t">${esc(c.materia)}</div><div class="curso-fila__s">${esc(c.nivel)}</div></div>
        <div class="curso-fila__der">${estado}<span class="flecha" aria-hidden="true"></span></div></summary>
      <ol class="lista-temas">${temas}</ol></details></li>`;
  }).join('');
} catch (e) {
  lista.innerHTML = '<li class="mcr-vacio">No se han podido cargar los cursos. Recarga la página.</li>';
}
