const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Split comma, semicolon, newline, or tab separated input (also handles simple CSV rows). */
export function parseEmailList(raw: string): {
  rawTokens: number;
  valid: string[];
  invalid: string[];
  duplicateInInput: number;
} {
  const tokens = raw
    .split(/[\s,;\t]+/)
    .map((t) => t.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  let duplicateInInput = 0;

  for (const token of tokens) {
    const email = token.toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      invalid.push(token);
      continue;
    }
    if (seen.has(email)) {
      duplicateInInput++;
      continue;
    }
    seen.add(email);
    valid.push(email);
  }

  return {
    rawTokens: tokens.length,
    valid,
    invalid,
    duplicateInInput,
  };
}
