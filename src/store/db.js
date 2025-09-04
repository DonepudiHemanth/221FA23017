import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let state = { links: {} };

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      state = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch {
    state = { links: {} };
  }
}
function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
  }
}

load();

export function has(code) {
  return !!state.links[code];
}
export function get(code) {
  return state.links[code] || null;
}
export function set(code, obj) {
  state.links[code] = obj;
  save();
}
export function update(code, updater) {
  if (!state.links[code]) return;
  state.links[code] = updater(state.links[code]);
  save();
}
