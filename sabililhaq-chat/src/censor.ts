// Minimal server-side censoring suitable for the simple chat service.
const bannedWords = ["sabililhaq"];

function maskMatch(match: string): string {
  return "*".repeat(match.length);
}

export function censorMessage(text: string): {
  censored: string;
  hadMatch: boolean;
} {
  let hadMatch = false;
  let censored = text;

  for (const word of bannedWords) {
    const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    if (re.test(censored)) {
      hadMatch = true;
      censored = censored.replace(re, (m) => maskMatch(m));
    }
  }

  return { censored, hadMatch };
}
