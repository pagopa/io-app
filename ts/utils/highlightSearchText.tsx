/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */

type HighlightChunk = { highlighted: boolean; text: string };

/**
 * Highlights search results client side that were made with ILIKE sql operator server side.
 * Tries to center the first match in the available space if esimatedTextLengthToDisplay provided
 */
export function highlightSearchText({
  text,
  searchText,
  estimatedTextLengthToDisplay
}: {
  text: string;
  searchText: string;
  estimatedTextLengthToDisplay?: number;
}): Array<HighlightChunk> {
  const textLowerCase = text.toLowerCase();
  const searchTextLowerCase = searchText.toLowerCase();
  const firstOccurrence = textLowerCase.indexOf(searchTextLowerCase);
  const relevantText =
    estimatedTextLengthToDisplay === undefined || firstOccurrence === -1
      ? text
      : "..." +
        text.slice(
          Math.max(
            0,
            firstOccurrence -
              Math.trunc(
                estimatedTextLengthToDisplay * 0.5 - searchText.length * 0.5
              )
          )
        );
  const relevantTextLowerCase = relevantText.toLowerCase();
  const matchMap = new Array(relevantText.length).fill(false);
  for (let textIndex = 0; textIndex < relevantText.length; ) {
    const matchStart = relevantTextLowerCase.indexOf(
      searchTextLowerCase,
      textIndex
    );
    if (matchStart === -1) {
      break;
    }
    for (
      let searchTextIndex = 0;
      searchTextIndex < searchText.length;
      searchTextIndex++
    ) {
      matchMap[matchStart + searchTextIndex] = true;
    }
    textIndex = matchStart + searchText.length;
  }
  const chunks: Array<HighlightChunk> = [];
  let currentChunk: HighlightChunk = { highlighted: false, text: "" };
  for (let index = 0; index < relevantText.length; index++) {
    const char = relevantText[index];
    const isHighlighted = matchMap[index];
    if (currentChunk.highlighted === isHighlighted) {
      currentChunk.text += char;
    } else {
      chunks.push(currentChunk);
      currentChunk = { highlighted: isHighlighted, text: char };
    }
  }
  chunks.push(currentChunk);
  return chunks;
}
