import fs from "fs";
import path from "path";

type InsertOptions = {
  anchor: RegExp | string;
  /** Human readable name of the edited file, used in error messages */
  fileName: string;
  /** Used to skip the edit when the generated file already contains it */
  marker: string;
  position: "after" | "before";
  snippet: string;
};

const findAnchor = (contents: string, anchor: RegExp | string) => {
  if (typeof anchor === "string") {
    return { index: contents.indexOf(anchor), text: anchor };
  }
  const result = anchor.exec(contents);
  return { index: result?.index ?? -1, text: result?.[0] ?? "" };
};

/**
 * Inserts `snippet` next to the first `anchor` occurrence. Throws when the
 * anchor is missing so template changes surface at prebuild time instead of
 * producing a silently broken native project.
 */
export const insertOnce = (
  contents: string,
  { anchor, marker, position, snippet, fileName }: InsertOptions
): string => {
  if (contents.includes(marker)) {
    return contents;
  }
  const match = findAnchor(contents, anchor);
  if (match.index < 0) {
    throw new Error(
      `[io-app config plugin] Cannot find ${String(anchor)} in ${fileName}`
    );
  }
  const insertAt =
    position === "after" ? match.index + match.text.length : match.index;
  return `${contents.slice(0, insertAt)}${snippet}${contents.slice(insertAt)}`;
};

/** Replaces the first `search` occurrence, throwing when it is missing. */
export const replaceOnce = (
  contents: string,
  search: string,
  replacement: string,
  fileName: string
): string => {
  if (contents.includes(replacement)) {
    return contents;
  }
  if (!contents.includes(search)) {
    throw new Error(
      `[io-app config plugin] Cannot find "${search}" in ${fileName}`
    );
  }
  return contents.replace(search, replacement);
};

/** Recursively copies `source` into `destination`, overwriting files. */
export const copyDirectory = (source: string, destination: string): void => {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach(entry => {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  });
};

/** Folder holding the hand-written native files restored at prebuild time */
export const NATIVE_SOURCES_DIR = path.join("app-config", "native");
