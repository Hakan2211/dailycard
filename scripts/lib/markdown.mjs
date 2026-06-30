// Pure Markdown parsing helpers for the card-decks vault files.
// No I/O — takes file contents (string), returns Maps keyed by card number.
//
// Card block delimiter (identical in image-prompts.md and share-text.md):
//   ## <N> · <EN Title> / <DE Title>

/** Split a vault md file into per-card blocks. `·` is U+00B7. */
function splitBlocks(md) {
  // Normalize CRLF/CR to LF: some vault files are CRLF, and a stray `\r` breaks
  // the fence-based caption matcher (its `[ \t]*\n` cannot absorb `\r`).
  md = md.replace(/\r\n?/g, "\n");
  const re = /^##\s+(\d+)\s*·\s*(.+?)\s*$/gm;
  const matches = [...md.matchAll(re)];
  const blocks = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const cardNumber = parseInt(m[1], 10);
    const titleLine = m[2];
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    const body = md.slice(start, end);
    const slashIdx = titleLine.indexOf(" / ");
    const enTitle = slashIdx >= 0 ? titleLine.slice(0, slashIdx).trim() : titleLine.trim();
    const deTitle = slashIdx >= 0 ? titleLine.slice(slashIdx + 3).trim() : "";
    blocks.push({ cardNumber, enTitle, deTitle, body });
  }
  return blocks;
}

/** Strip common leading indentation and trim surrounding blank lines. */
function dedent(text) {
  let lines = text.split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^[ \t]*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  lines = lines.map((l) => l.slice(min));
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines.join("\n");
}

/**
 * Extract the baked English headline/quote from a card block. Two vault formats:
 *   1. Headline style: **Headline — DE:** `DE` · **EN:** `EN`      (EN in backticks)
 *   2. Tom/Quote style: **Quote — EN:** "EN" · **DE:** "DE"        (EN in double quotes)
 * Both anchor on `EN:**`; the leading `(EN):` of Story/Caption never matches `EN:**`.
 */
function extractEnHeadline(body) {
  let m = body.match(/\bEN:\*\*\s*`([^`]+)`/); // backtick form
  if (m) return m[1].trim();
  m = body.match(/\bEN:\*\*\s*["“]([^"“”]+)["”]/); // quoted form
  return m ? m[1].trim() : "";
}

/**
 * Extract the baked German headline/quote from a card block. Same two formats as
 * the English headline, anchored on `DE:**`. The `(DE):` of a Story/Caption line
 * never matches `DE:**`, so this only picks up the headline line. This is the exact
 * text baked into the German card image (e.g. `ZURUECK ZUM FUNDAMENT`).
 */
function extractDeHeadline(body) {
  let m = body.match(/\bDE:\*\*\s*`([^`]+)`/); // backtick form
  if (m) return m[1].trim();
  m = body.match(/\bDE:\*\*\s*["“]([^"“”]+)["”]/); // quoted form
  return m ? m[1].trim() : "";
}

/**
 * Parse an image-prompts.md file.
 * Returns Map<cardNumber, { enTitle, deTitle, enHeadline, deHeadline }>.
 */
export function parseImagePrompts(md) {
  const map = new Map();
  for (const b of splitBlocks(md)) {
    map.set(b.cardNumber, {
      enTitle: b.enTitle,
      deTitle: b.deTitle,
      enHeadline: extractEnHeadline(b.body),
      deHeadline: extractDeHeadline(b.body),
    });
  }
  return map;
}

/**
 * Parse a share-text.md file.
 * Returns Map<cardNumber, { storyEn?, captionEn?, storyDe?, captionDe? }>.
 */
export function parseShareText(md) {
  const map = new Map();
  const storyRe = (lang) =>
    new RegExp(`^[ \\t]*-\\s*\\*\\*Story \\(${lang}\\):\\*\\*\\s*(.+?)\\s*$`, "m");
  const capRe = (lang) =>
    new RegExp(
      `\\*\\*Caption \\(${lang}\\):\\*\\*[^\\n]*\\n[ \\t]*\`\`\`(?:text)?[ \\t]*\\n([\\s\\S]*?)\\n[ \\t]*\`\`\``
    );
  for (const b of splitBlocks(md)) {
    const storyEn = b.body.match(storyRe("EN"));
    const capEn = b.body.match(capRe("EN"));
    const storyDe = b.body.match(storyRe("DE"));
    const capDe = b.body.match(capRe("DE"));
    map.set(b.cardNumber, {
      storyEn: storyEn ? storyEn[1].trim() : undefined,
      captionEn: capEn ? dedent(capEn[1]) : undefined,
      storyDe: storyDe ? storyDe[1].trim() : undefined,
      captionDe: capDe ? dedent(capDe[1]) : undefined,
    });
  }
  return map;
}
