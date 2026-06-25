// Pure Markdown parsing helpers for the card-decks vault files.
// No I/O — takes file contents (string), returns Maps keyed by card number.
//
// Card block delimiter (identical in image-prompts.md and share-text.md):
//   ## <N> · <EN Title> / <DE Title>

/** Split a vault md file into per-card blocks. `·` is U+00B7. */
function splitBlocks(md) {
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
 * Parse an image-prompts.md file.
 * Returns Map<cardNumber, { enTitle, deTitle, enHeadline }>.
 */
export function parseImagePrompts(md) {
  const map = new Map();
  for (const b of splitBlocks(md)) {
    map.set(b.cardNumber, {
      enTitle: b.enTitle,
      deTitle: b.deTitle,
      enHeadline: extractEnHeadline(b.body),
    });
  }
  return map;
}

/**
 * Parse a share-text.md file.
 * Returns Map<cardNumber, { storyEn?, captionEn? }>.
 */
export function parseShareText(md) {
  const map = new Map();
  for (const b of splitBlocks(md)) {
    const story = b.body.match(/^[ \t]*-\s*\*\*Story \(EN\):\*\*\s*(.+?)\s*$/m);
    const cap = b.body.match(
      /\*\*Caption \(EN\):\*\*[^\n]*\n[ \t]*```(?:text)?[ \t]*\n([\s\S]*?)\n[ \t]*```/
    );
    map.set(b.cardNumber, {
      storyEn: story ? story[1].trim() : undefined,
      captionEn: cap ? dedent(cap[1]) : undefined,
    });
  }
  return map;
}
