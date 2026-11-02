/**
 * A deliberately tiny TypeScript-ish highlighter.
 *
 * It only needs to handle the source strings this site generates itself
 * (single-line strings, line comments, objects, arrays), so ~60 lines of
 * regex beats shipping a full grammar to the browser.
 */

export type TokenType =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "constant"
  | "property"
  | "function"
  | "type"
  | "punct"
  | "plain";

export type Token = { type: TokenType; value: string; href?: string };

const KEYWORDS = new Set([
  "const", "let", "var", "export", "import", "from", "type", "interface",
  "as", "satisfies", "return", "function", "new", "readonly", "extends",
  "keyof", "typeof", "default", "if", "else",
]);
const CONSTANTS = new Set(["true", "false", "null", "undefined"]);
const BUILTIN_TYPES = new Set(["string", "number", "boolean", "Record", "Array"]);

const RULES: [kind: "comment" | "string" | "number" | "ident" | "space" | "punct", re: RegExp][] = [
  ["comment", /\/\/.*/y],
  ["string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y],
  ["number", /\d[\d_]*(?:\.\d+)?/y],
  ["ident", /[A-Za-z_$][\w$]*/y],
  ["space", /\s+/y],
  ["punct", /[^\sA-Za-z0-9_$"'`]/y],
];

const LINK_RE = /^(https?:\/\/|mailto:)/;

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    let matched = false;

    for (const [kind, re] of RULES) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (!m) continue;

      const value = m[0];
      const rest = line.slice(i + value.length);
      let type: TokenType;

      switch (kind) {
        case "ident":
          // `from: "2025-10"` is a key, not the keyword
          if (/^\s*\??:/.test(rest)) type = "property";
          else if (KEYWORDS.has(value)) type = "keyword";
          else if (CONSTANTS.has(value)) type = "constant";
          else if (/^\s*\(/.test(rest)) type = "function";
          else if (BUILTIN_TYPES.has(value) || /^[A-Z]/.test(value)) type = "type";
          else type = "plain";
          break;
        case "space":
          type = "plain";
          break;
        default:
          type = kind;
      }

      const token: Token = { type, value };
      if (type === "string") {
        const inner = value.slice(1, -1);
        if (LINK_RE.test(inner)) token.href = inner;
      }

      // merge adjacent plain/punct runs to keep the DOM small
      const prev = tokens[tokens.length - 1];
      if (prev && prev.type === type && (type === "plain" || type === "punct")) {
        prev.value += value;
      } else {
        tokens.push(token);
      }

      i += value.length;
      matched = true;
      break;
    }

    if (!matched) {
      tokens.push({ type: "plain", value: line[i] });
      i += 1;
    }
  }

  return tokens;
}

/** `Field: value` + `# comment` — enough for security.txt */
function tokenizeTxtLine(line: string): Token[] {
  if (line.startsWith("#")) return [{ type: "comment", value: line }];
  const m = line.match(/^([A-Za-z-]+)(:\s*)(.*)$/);
  if (!m) return line ? [{ type: "plain", value: line }] : [];
  const value: Token = { type: "string", value: m[3] };
  if (LINK_RE.test(m[3])) value.href = m[3];
  return [{ type: "property", value: m[1] }, { type: "punct", value: m[2] }, value];
}

export function highlight(source: string, lang: "ts" | "txt" = "ts"): Token[][] {
  return source.split("\n").map(lang === "txt" ? tokenizeTxtLine : tokenizeLine);
}
