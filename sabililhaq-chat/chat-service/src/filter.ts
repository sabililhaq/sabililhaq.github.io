import {
  DataSet,
  RegExpMatcher,
  TextCensor,
  englishRecommendedTransformers,
  pattern,
} from 'obscenity';
import bannedWords from './dict.json' with { type: 'json' };

// Build a custom dataset from our merged Bahasa word list instead of using
// englishDataset. The recommended transformer set (leetspeak decoding,
// repeated-char collapsing, unicode homoglyph normalization, whitespace
// stripping) is language-agnostic — it operates on the surface form of the
// text, not English semantics — so it's safe to reuse here.
const dataset = new DataSet<{ originalWord: string }>();

for (const word of bannedWords as string[]) {
  dataset.addPhrase((phrase) =>
    phrase.setMetadata({ originalWord: word }).addPattern(pattern`${word}`),
  );
}

const matcher = new RegExpMatcher({
  ...dataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();

/**
 * Returns the censored version of `text`. The RAW text is what the backend
 * receives and briefly holds in memory (per spec) — only the broadcast /
 * stored copy is filtered.
 */
export function censorMessage(text: string): { censored: string; hadMatch: boolean } {
  const matches = matcher.getAllMatches(text);
  if (matches.length === 0) {
    return { censored: text, hadMatch: false };
  }
  return { censored: censor.applyTo(text, matches), hadMatch: true };
}
