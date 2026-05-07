/**
 * Syncs AI assistant instruction files from CLAUDE.md (canonical source).
 *
 * CLAUDE.md is the single source of truth for shared rules.
 * Run after editing CLAUDE.md — it rewrites GEMINI.md, AGENTS.md, and
 * .github/copilot-instructions.md with the same content, swapping only
 * the header line so each file is addressed to the right assistant.
 *
 * Usage:
 *   node scripts/sync-ai-rules.mjs
 *
 * Wired as a Claude Code post-edit hook in .claude/settings.json so it
 * runs automatically when CLAUDE.md is saved.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = resolve(root, "CLAUDE.md");

const TARGETS = [
  {
    file: resolve(root, "GEMINI.md"),
    header: "# Gemini — project rules for ShareConsolidated (Bird AI)",
  },
  {
    file: resolve(root, "AGENTS.md"),
    header: "# Codex — project rules for ShareConsolidated (Bird AI)",
  },
  {
    file: resolve(root, ".github/copilot-instructions.md"),
    header:
      "# GitHub Copilot / Codex — project rules for ShareConsolidated (Bird AI)",
  },
];

const source = readFileSync(SOURCE, "utf8");

// Extract everything after the first header line (line 1)
const lines = source.split("\n");
const bodyStart = lines.findIndex((l, i) => i > 0 && l.startsWith("#"));
const body = lines.slice(bodyStart === -1 ? 1 : bodyStart).join("\n");

let synced = 0;
for (const { file, header } of TARGETS) {
  const content = `${header}\n${body}`;
  writeFileSync(file, content, "utf8");
  console.log(`✓ synced → ${file.replace(root + "/", "")}`);
  synced++;
}

console.log(`\nSynced ${synced} files from CLAUDE.md`);
