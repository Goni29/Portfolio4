import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { TextDecoder } from "node:util";

const ROOT = process.cwd();
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css"]);
const LITERAL_CHECK_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"]);
const IGNORE_DIRS = new Set([".git", ".next", "node_modules", "out", "build", "coverage"]);

const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const c1ControlPattern = /[\u0080-\u009f]/u;
const replacementPattern = /\uFFFD/u;
const stringLiteralPattern = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g;
const koreanLikePattern = /[\uac00-\ud7a3\u3131-\u318e\u4e00-\u9fff]/u;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".editorconfig" && entry.name !== ".gitattributes") {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.name.includes(".bak")) {
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(extname(entry.name))) {
      continue;
    }

    files.push(fullPath);
  }
  return files;
}

function addIssue(issues, file, line, kind, detail) {
  issues.push({ file, line, kind, detail });
}

function looksLikeBrokenKorean(text) {
  if (!text.includes("?")) return false;
  if (!koreanLikePattern.test(text)) return false;
  if (text.includes("??")) return true;

  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  if (trimmed.endsWith("?")) {
    const withoutLastQuestion = trimmed.slice(0, -1);
    return withoutLastQuestion.includes("?");
  }

  return true;
}

function inspectFile(file, issues) {
  const extension = extname(file);
  let decoded;
  let buffer;
  try {
    buffer = readFileSync(file);
    decoded = utf8Decoder.decode(buffer);
  } catch {
    addIssue(issues, file, 1, "invalid-utf8", "file is not valid UTF-8");
    return;
  }

  const lines = decoded.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNumber = i + 1;

    if (replacementPattern.test(line)) {
      addIssue(issues, file, lineNumber, "replacement-char", "contains U+FFFD replacement character");
    }
    if (c1ControlPattern.test(line)) {
      addIssue(issues, file, lineNumber, "c1-control", "contains C1 control characters");
    }

    if (LITERAL_CHECK_EXTENSIONS.has(extension)) {
      for (const match of line.matchAll(stringLiteralPattern)) {
        const text = match[1] ?? match[2] ?? "";
        if (looksLikeBrokenKorean(text)) {
          addIssue(issues, file, lineNumber, "mojibake-suspect", `suspicious literal: "${text}"`);
        }
      }
    }
  }
}

function main() {
  const files = walk(ROOT);
  const issues = [];

  for (const file of files) {
    inspectFile(file, issues);
  }

  if (issues.length === 0) {
    console.log(`[text-check] OK (${files.length} files scanned)`);
    return;
  }

  console.error(`[text-check] FAILED (${issues.length} issues found)`);
  for (const issue of issues) {
    console.error(`- ${issue.file}:${issue.line} [${issue.kind}] ${issue.detail}`);
  }
  process.exit(1);
}

main();
