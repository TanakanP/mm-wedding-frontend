import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function renderWishWall(userWish, { reducedMotion = false } = {}) {
  const source = await readFile(
    new URL("../src/components/PlantWishWall.tsx", import.meta.url),
    "utf8"
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const state = [];
  const refs = [];
  const effects = [];
  let stateIndex = 0;
  let refIndex = 0;

  const react = {
    useEffect(effect) {
      effects.push(effect);
    },
    useRef(initialValue) {
      const index = refIndex++;
      refs[index] ??= { current: initialValue };
      return refs[index];
    },
    useState(initialValue) {
      const index = stateIndex++;
      state[index] ??= typeof initialValue === "function" ? initialValue() : initialValue;
      return [
        state[index],
        (nextValue) => {
          state[index] = typeof nextValue === "function" ? nextValue(state[index]) : nextValue;
        },
      ];
    },
  };
  const jsxRuntime = {
    Fragment: "Fragment",
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  };
  const framerMotion = {
    AnimatePresence: "AnimatePresence",
    motion: new Proxy({}, { get: (_target, tag) => tag }),
    useReducedMotion: () => reducedMotion,
  };
  const require = (specifier) => {
    if (specifier === "react") return react;
    if (specifier === "react/jsx-runtime") return jsxRuntime;
    if (specifier === "framer-motion") return framerMotion;
    if (specifier === "@/hooks/useHydrationSafeReducedMotion") {
      return { useHydrationSafeReducedMotion: () => reducedMotion };
    }
    throw new Error(`Unexpected import: ${specifier}`);
  };
  const compiledModule = { exports: {} };

  new Function("require", "module", "exports", outputText)(
    require,
    compiledModule,
    compiledModule.exports
  );
  const rendered = compiledModule.exports.default({ userWish });

  const expand = (node) => {
    if (Array.isArray(node)) return node.map(expand);
    if (!node || typeof node !== "object") return node;
    if (typeof node.type === "function") return expand(node.type(node.props));
    return {
      ...node,
      props: { ...node.props, children: expand(node.props?.children) },
    };
  };

  return { effects, rendered: expand(rendered), state };
}

function findNodes(node, predicate, matches = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => findNodes(child, predicate, matches));
  } else if (node && typeof node === "object") {
    if (predicate(node)) matches.push(node);
    findNodes(node.props?.children, predicate, matches);
  }
  return matches;
}

test("personalized wish survives the Strict Mode effect replay", async () => {
  const { effects, state } = await renderWishWall({
    name: "Mali",
    message: "Grow together",
  });
  const setup = effects[0];

  const cleanup = setup();
  cleanup();
  setup();
  assert.equal(state[0].length, 4);
  await new Promise((resolve) => setTimeout(resolve, 700));

  assert.equal(state[0].length, 5);
  assert.deepEqual(state[0].at(-1), {
    id: state[0].at(-1).id,
    name: "Mali",
    message: "Grow together",
  });
});

test("reduced motion plants the personalized wish immediately", async () => {
  const { effects, state } = await renderWishWall(
    { name: "Mali", message: "Grow together" },
    { reducedMotion: true }
  );
  const setup = effects[0];

  const cleanup = setup();
  assert.equal(state[0].length, 5);
  cleanup?.();
  setup();

  assert.equal(state[0].length, 5);
  assert.equal(
    state[0].filter(
      (wish) => wish.name === "Mali" && wish.message === "Grow together"
    ).length,
    1
  );
});

test("wish flowers retain a visible keyboard focus indicator", async () => {
  const { rendered } = await renderWishWall();
  const flowerButtons = findNodes(
    rendered,
    (node) => node.type === "button" && node.props?.["aria-label"]?.startsWith("Wish from ")
  );

  assert.equal(flowerButtons.length, 4);
  for (const button of flowerButtons) {
    assert.match(button.props.className, /focus-visible:ring-2/);
    assert.match(button.props.className, /focus-visible:ring-wine/);
    assert.match(button.props.className, /focus-visible:ring-offset-2/);
  }
});
