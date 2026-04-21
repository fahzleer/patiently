// Server-side stub for firebase/* imports.
// All Firebase usage in this project is inside "use client" hooks behind
// useEffect, so these functions are never actually called during SSR.
// The Proxy returns a no-op for any property access so named imports
// (ref, set, onValue, initializeApp, …) don't throw when destructured.
module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__esModule") return true;
      if (prop === "default") return module.exports;
      return () => {};
    },
  }
);
