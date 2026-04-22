#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Node 25+ exposes an experimental WebStorage API that collides with Next.js's
// DevOverlay during SSR (localStorage.getItem is not a function, HTTP 500).
// Pointing localStorage at a file neutralizes the clash. Older Node versions
// reject the flag in NODE_OPTIONS, so gate it by version.
const major = Number(process.versions.node.split(".")[0]);
const env = { ...process.env };
if (major >= 25) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--localstorage-file=.next/localstorage.json"]
    .filter(Boolean)
    .join(" ");
}

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev"], { stdio: "inherit", env });

child.on("error", (err) => {
  console.error("[dev] failed to spawn next:", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  // Re-raise the terminating signal so callers (CI, terminals) see the real
  // cause of death instead of a spurious exit 0.
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
