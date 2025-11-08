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
// Pruebas de calculadora removidas temporalmente
