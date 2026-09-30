import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
const nativeRequire = createRequire(import.meta.url);

// Only replace browser hooks and external UI primitives; execute real component handlers.
export async function componentHarness(path, dependencies = {}) {
  let stateIndex = 0, refIndex = 0, effectIndex = 0;
  const states = [], refs = [], effects = [];
  const react = {
    useState(initial) {
      const i = stateIndex++;
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
      return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
    },
    useRef(initial) { const i = refIndex++; refs[i] ??= { current: initial }; return refs[i]; },
    useEffect(fn, deps) {
      const i = effectIndex++, old = effects[i];
      if (!old || !deps || deps.some((x, j) => x !== old.deps?.[j])) {
        old?.cleanup?.(); effects[i] = { fn, deps, pending: true };
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const source = await readFile(path, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  }}).outputText;
  const compiledModule = { exports: {} };
  const require = id => {
    if (id in dependencies) return dependencies[id];
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
    if (id === 'framer-motion') return { motion: new Proxy({}, { get: (_, key) => key }) };
    return nativeRequire(id);
  };
  new Function('require', 'module', 'exports', compiled)(require, compiledModule, compiledModule.exports);
  return {
    render(props = {}) { stateIndex = refIndex = effectIndex = 0; return compiledModule.exports.default(props); },
    renderComponent(component, props = {}) { stateIndex = refIndex = effectIndex = 0; return component(props); },
    flushEffects() { for (const e of effects) if (e.pending) { e.pending = false; e.cleanup = e.fn(); } },
    cleanup() { effects.forEach(e => e.cleanup?.()); },
  };
}
export function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(x => nodes(x, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
