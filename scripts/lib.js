// Shared helpers for hooks and scripts. Node only — no bash, no Python — so the plugin runs the
// same on Windows, macOS and Linux with nothing beyond Claude Code's own runtime.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, "..");
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

/** Forward-slash a path so regexes behave the same on Windows. */
const norm = (p) => (p || "").replace(/\\/g, "/");

/** Read the JSON Claude Code sends a hook on stdin. */
function readStdinJson() {
  try { return JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

/** Resolve the client root: FLA_CLIENT_ROOT > nearest engagement.yaml above hint > sole clients/<x>. */
function clientRoot(hint) {
  const env = process.env.FLA_CLIENT_ROOT;
  if (env && fs.existsSync(path.join(env, "engagement.yaml"))) return env;
  if (hint) {
    let d = path.dirname(path.resolve(hint));
    for (;;) {
      if (fs.existsSync(path.join(d, "engagement.yaml"))) return d;
      const up = path.dirname(d); if (up === d) break; d = up;
    }
  }
  const cdir = path.join(PROJECT_DIR, "clients");
  if (fs.existsSync(cdir)) {
    const c = fs.readdirSync(cdir).filter((n) => n !== "_template" && fs.existsSync(path.join(cdir, n, "engagement.yaml")));
    if (c.length === 1) return path.join(cdir, c[0]);
  }
  return "";
}

/** Minimal YAML reader for the flat/one-level files this plugin uses (engagement.yaml, naming.yaml, pricing.yaml). */
function readYamlLite(file) {
  const out = {}; let section = null;
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(/^(\s*)([\w.\-]+):\s*(.*)$/); if (!m) continue;
    const [, indent, key, rawVal] = m; let val = rawVal.trim();
    if (val.startsWith("{") && val.endsWith("}")) {           // inline map { a: 1, b: 2 }
      const obj = {}; for (const kv of val.slice(1, -1).split(",")) { const [k, v] = kv.split(":").map((s) => s.trim()); if (k) obj[k] = isNaN(v) ? v : Number(v); } val = obj;
    } else if (val.startsWith("[")) val = val.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    else if (val === "true" || val === "false") val = val === "true";
    else if (val !== "" && !isNaN(val)) val = Number(val);
    else val = val.replace(/^"(.*)"$/, "$1");
    if (indent.length === 0) { if (val === "") { section = key; out[key] = {}; } else { section = null; out[key] = val; } }
    else if (section) out[section][key] = val;
  }
  return out;
}

/** Append one JSON line to <root>/audit/<today>.jsonl. */
function appendAudit(root, rec) {
  const dir = path.join(root, "audit"); fs.mkdirSync(dir, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(path.join(dir, day + ".jsonl"), JSON.stringify(rec) + "\n");
}

const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
const todayCompact = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

/** Is an executable on PATH? (cross-platform) */
function onPath(exe) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [exe], { encoding: "utf8" });
  return r.status === 0;
}

function git(args, cwd) {
  try { return execSync("git " + args, { cwd: cwd || PROJECT_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; }
}

/** Walk a directory recursively, returning files matching a predicate. */
function walk(dir, pred, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, pred, acc); else if (pred(p)) acc.push(p);
  }
  return acc;
}

module.exports = { PLUGIN_ROOT, PROJECT_DIR, norm, readStdinJson, clientRoot, readYamlLite, appendAudit, nowIso, todayCompact, onPath, git, walk };
