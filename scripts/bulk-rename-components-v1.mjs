/**
 * One-off: rename src/app/components tsx files (except .v1.tsx) to .v1.tsx
 * and write a shim with re-exports.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../src/app/components");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".tsx") && !name.endsWith(".v1.tsx")) out.push(full);
  }
  return out;
}

function hasDefaultExport(src) {
  return (
    /^\s*export\s+default\b/m.test(src) ||
    /^\s*export\s*\{\s*default\s*\}/m.test(src)
  );
}

const files = walk(ROOT).sort((a, b) => b.length - a.length);

for (const filePath of files) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const stem = base.replace(/\.tsx$/, "");
  const v1Path = path.join(dir, `${stem}.v1.tsx`);

  if (fs.existsSync(v1Path)) {
    console.error("Skip (already exists):", v1Path);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  fs.renameSync(filePath, v1Path);

  let shim = `export * from "./${stem}.v1";\n`;
  if (hasDefaultExport(content)) {
    shim += `export { default } from "./${stem}.v1";\n`;
  }

  fs.writeFileSync(path.join(dir, `${stem}.tsx`), shim, "utf8");
  console.log("OK:", path.relative(ROOT, filePath), "->", `${stem}.v1.tsx + shim`);
}

console.log("Done.", files.length, "files");
