import {
  DataSet,
  RegExpMatcher,
  indonesianDataset,
  indonesianRecommendedTransformers,
  pattern,
} from "obscenity";
// import bannedWords from "../../../sabililhaq-chat/chat-service/src/dict.json" with { type: "json" };

const bannedWords = ["sabililhaq"];

const dataset = new DataSet<{ originalWord: string }>().addAll(
  indonesianDataset,
);

for (const word of bannedWords as string[]) {
  dataset.addPhrase((phrase) =>
    phrase.setMetadata({ originalWord: word }).addPattern(pattern`${word}`),
  );
}

const matcher = new RegExpMatcher({
  ...dataset.build(),
  ...indonesianRecommendedTransformers,
});

function applySimpleAsteriskMask(text: string): string {
  const matches = [...matcher.getAllMatches(text)].sort(
    (a, b) => a.startIndex - b.startIndex,
  );
  if (matches.length === 0) {
    return text;
  }

  let result = "";
  let cursor = 0;

  for (const match of matches) {
    if (match.startIndex < cursor) {
      continue;
    }

    result += text.slice(cursor, match.startIndex);
    result += "*".repeat(match.matchLength);
    cursor = match.startIndex + match.matchLength;
  }

  result += text.slice(cursor);
  return result;
}

export function censorMessage(text: string): {
  censored: string;
  hadMatch: boolean;
} {
  const censored = applySimpleAsteriskMask(text);
  return {
    censored,
    hadMatch: censored !== text,
  };
}
