// test/calculadora.test.js
// para pribar : npx mocha test/calculadora.test.js
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');
const { expect } = require('chai');

// ==== RUTA A TU HTML ====
const CALC_HTML = path.resolve(__dirname, '../public/calculadora.html');

function makeMini$ (window) {
  const document = window.document;

  function wrap(nodes) {
    const arr = Array.isArray(nodes) ? nodes : (nodes instanceof window.NodeList ? Array.from(nodes) :
                 nodes ? [nodes] : []);
    const api = {
      length: arr.length,
      0: arr[0],
      eq(i) {
        return wrap(arr[i]);
      },
      val(v) {
        if (v === undefined) {
          return arr[0]?.value;
        }
        arr.forEach(n => { if ('value' in n) n.value = v; });
        return api;
      },
      text(v) {
        if (v === undefined) {
          return (arr[0]?.textContent ?? '');
        }
        arr.forEach(n => { n.textContent = v; });
        return api;
      },
      prop(name, v) {
        if (v === undefined) {
          return arr[0] ? !!arr[0][name] : undefined;
        }
        arr.forEach(n => { n[name] = v; });
        return api;
      }
    };
    return api;
  }

  function $(selector) {
    if (typeof selector === 'string') {
      if (selector.startsWith('#')) {
        return wrap(document.getElementById(selector.slice(1)));
      }
      return wrap(document.querySelectorAll(selector));
    }
    if (selector instanceof window.Node || selector instanceof window.Window || selector == null) {
      return wrap(selector);
    }
    return wrap([]);
  }

  return $;
}

function loadDomAndEvalScripts(htmlPath, beforeEvalCb) {
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`No se encontró el HTML en: ${htmlPath}`);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    resources: 'usable'
  });

  const { window } = dom;

  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;

  if (typeof beforeEvalCb === 'function') beforeEvalCb(window);

  const htmlDir = path.dirname(htmlPath);
  const scripts = [...window.document.querySelectorAll('script')];

  const runInWindow = (code, filename = 'inline.js') => {
    const ctx = vm.createContext(window);
    const script = new vm.Script(code, { filename });
    script.runInContext(ctx);
  };

  for (const tag of scripts) {
    const type = (tag.getAttribute('type') || '').trim();
    if (type && type !== '' && type !== 'text/javascript') {
      continue;
    }
    const src = tag.getAttribute('src');
    if (src) {
      const filePath = path.resolve(htmlDir, src);
      if (fs.existsSync(filePath)) {
        const code = fs.readFileSync(filePath, 'utf8');
        runInWindow(code, src);
      } else {
      }
    } else {
      const inline = tag.textContent || '';
      if (inline.trim()) runInWindow(inline, 'inline.js');
    }
  }

  if (!window.$ || !window.jQuery) {
    const mini = makeMini$(window);
    window.$ = window.jQuery = mini;
    global.$ = mini;
  } else {
    global.$ = window.$;
  }

  return {
    window,
    document: window.document,
    $: window.$,
    cleanup: () => window.close()
  };
}

// ========================= TUS PRUEBAS =========================
describe('Calculadora de riesgos · pruebas extra (diferentes)', function () {
  this.timeout(3000);

  it('deshabilita Guardar hasta que se calcule un riesgo válido', function () {
    const { $ } = loadDomAndEvalScripts(CALC_HTML);
    expect($('#btnGuardar').prop('disabled')).to.equal(true);

    $('#nombre').val('');
    $('#probabilidad').val('0');
    $('#impacto').val('6');
    const btnCalc = document.getElementById('btnCalcular');
    btnCalc && btnCalc.click();

    expect($('#btnGuardar').prop('disabled')).to.equal(true);
  });

  it('mapea bordes de rango: 1x1 = 1 (Bajo), 5x5 = 25 (Crítico)', function () {
    const { $ } = loadDomAndEvalScripts(CALC_HTML);

    $('#nombre').val('Edge Bajo');
    $('#probabilidad').val('1');
    $('#impacto').val('1');
    document.getElementById('btnCalcular')?.click();
    expect(($('#score').text() || '').trim()).to.equal('1');
    expect($('#badge').text()).to.match(/Bajo/i);

    $('#nombre').val('Edge Crítico');
    $('#probabilidad').val('5');
    $('#impacto').val('5');
    document.getElementById('btnCalcular')?.click();
    expect(($('#score').text() || '').trim()).to.equal('25');
    expect($('#badge').text()).to.match(/Crítico/i);
  });

  it('si dos riesgos tienen el mismo score, mantiene orden estable por fecha (último arriba o abajo según tu lógica)', function () {
    const { $ } = loadDomAndEvalScripts(CALC_HTML);

    $('#nombre').val('A');
    $('#probabilidad').val('3');
    $('#impacto').val('3');
    document.getElementById('btnCalcular')?.click();
    document.getElementById('btnGuardar')?.click();

    $('#nombre').val('B');
    $('#probabilidad').val('3');
    $('#impacto').val('3');
    document.getElementById('btnCalcular')?.click();
    document.getElementById('btnGuardar')?.click();

    const items = document.querySelectorAll('#lista .item');
    expect(items.length).to.be.greaterThanOrEqual(2);

    const concat = (items[0].textContent || '') + '|' + (items[1].textContent || '');
    expect(concat).to.match(/A.*\|.*B|B.*\|.*A/);
  });

  it('limpiar borra además la selección de celdas/matriz si la UI pinta algo', function () {
    const { $, document: doc } = loadDomAndEvalScripts(CALC_HTML);

    $('#nombre').val('R1');
    $('#probabilidad').val('4');
    $('#impacto').val('2');
    document.getElementById('btnCalcular')?.click();

    const cell = doc.querySelector('.matrix .cell.selected') || doc.querySelector('.matrix .cell');
    if (cell) cell.classList.add('selected');

    document.getElementById('btnLimpiar')?.click();

    const anySelected = !!doc.querySelector('.matrix .cell.selected');
    expect(anySelected).to.equal(false);
  });

  it('valida inputs no numéricos: ignora texto y muestra hint de error', function () {
    const { $ } = loadDomAndEvalScripts(CALC_HTML);

    $('#nombre').val('R2');
    $('#probabilidad').val('abc');
    $('#impacto').val('def');
    document.getElementById('btnCalcular')?.click();

    expect($('#score').text()).to.match(/—|NaN/);
    expect($('#mensaje').text()).to.match(/Ingrese valores del 1 al 5|inválid/i);
    expect($('#btnGuardar').prop('disabled')).to.equal(true);
  });

  it('persiste en localStorage y al recargar reconstruye la lista (smoke)', function () {
    let ctx = loadDomAndEvalScripts(CALC_HTML);
    let $ = ctx.$;

    $('#nombre').val('Persist');
    $('#probabilidad').val('2');
    $('#impacto').val('4');
    ctx.document.getElementById('btnCalcular')?.click();
    ctx.document.getElementById('btnGuardar')?.click();

    const stored =
      ctx.window.localStorage.getItem('riesgos') ||
      ctx.window.localStorage.getItem('riskList') ||
      ctx.window.localStorage.getItem('lista');

    ctx = loadDomAndEvalScripts(CALC_HTML, (w) => {
      if (stored) w.localStorage.setItem('riesgos', stored); // ajusta clave si tu app usa otra
    });
    $ = ctx.$;

    const items = ctx.document.querySelectorAll('#lista .item');
    expect(items.length).to.be.greaterThan(0);
    const txt = (items[0].textContent || '');
    expect(/Persist/.test(txt)).to.equal(true);
  });
});
