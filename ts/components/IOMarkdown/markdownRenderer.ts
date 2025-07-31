import { parse as textLintParse } from "@textlint/markdown-to-ast";
import {
  AnyTxtNode,
  TxtHeaderNode,
  TxtLinkNode,
  TxtListNode,
  TxtNode,
  TxtParagraphNode,
  TxtParentNode,
  TxtStrNode
} from "@textlint/ast-node-types";
import { omit } from "lodash";
import { isIos } from "../../utils/platform";
import { AnyTxtNodeWithSpacer, IOMarkdownRenderRules, Renderer } from "./types";

/**
 *
 * @param rules The `markdown` render rules.
 * @returns A render function for the individual node that applies the provided rendering rules.
 */
export function getRenderMarkdown(
  rules: IOMarkdownRenderRules,
  screenReaderEnabled: boolean
): Renderer {
  return (content: AnyTxtNodeWithSpacer) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rules[content.type]?.(
      content,
      getRenderMarkdown(rules, screenReaderEnabled),
      screenReaderEnabled
    ) ?? null;
}

/**
 * This component extends the `parse` method of `@textlint/markdown-to-ast` by inserting a custom node with type `Spacer` between first-level nodes that have at least one empty line between them.
 *
 * The spacer node takes a `size` of `8` when a single empty row is encountered, and `16` when 2 or more empty rows are encountered.
 * @param content The `markdown` string to parse.
 * @returns The parsed content.
 */
export function parse(content: string): Array<AnyTxtNodeWithSpacer> {
  const parsedContent = textLintParse(content);
  return integrateParent(parsedContent).children.reduce<
    Array<AnyTxtNodeWithSpacer>
  >((acc, currNode, idx, self) => {
    const nextNode = self[idx + 1];
    const nextNodeBeginning = nextNode?.loc.start.line;
    const currNodeEnding = currNode.loc.end.line;
    const diff = nextNodeBeginning - currNodeEnding;

    if (diff > 1) {
      return [
        ...acc,
        currNode,
        {
          type: "Spacer",
          size: Math.min(2, diff - 1) * 8,
          key: `Spacer_${currNodeEnding}_${nextNodeBeginning}`
        }
      ];
    }
    return [...acc, currNode];
  }, []);
}

function integrateParent<T extends AnyTxtNode>(
  node: T,
  parent?: TxtParentNode
): T {
  const parentLight = omit(parent, "children");

  return "children" in node
    ? {
        ...node,
        children: node.children.map(n =>
          integrateParent(n, { ...node, parent })
        ),
        parent: parentLight
      }
    : { ...node, parent: parentLight };
}

/**
 * Converts Markdown reference-style links to inline links
 * since IOMarkdown does not support the former.
 *
 * Reference-style links consist of two parts:
 * 1. The link reference: [text][label] or [text][] (shortcut form)
 * 2. The link definition: [label]: URL "optional title"
 *
 * This function finds all link definitions, then replaces all reference-style
 * links with their corresponding inline format: [text](URL)
 *
 * @param {string} markdownText - The markdown text containing reference-style links
 * @returns {string} The markdown text with reference-style links converted to inline links
 *
 * @example
 * const input = `
 * Check out [Google][1] and [GitHub][gh].
 *
 * [1]: https://google.com "Search Engine"
 * [gh]: https://github.com
 * `;
 *
 * const output = convertReferenceLinksToInline(input);
 * // Result:
 * // Check out [Google](https://google.com) and [GitHub](https://github.com).
 */
export const convertReferenceLinksToInline = (markdownText: string): string => {
  // First, extract all link definitions [label]: URL "optional title"
  // Specs https://www.markdownguide.org/basic-syntax/#reference-style-links
  const linkDefinitions = new Map();
  const linkDefRegex =
    /^\s*\[([^\]]+)\]:\s*(<[^>]+>|[^\s]+)(?:\s+["'(]([^"')]+)["')])?/gm;

  while (true) {
    const match = linkDefRegex.exec(markdownText);
    if (match === null) {
      break;
    }
    // Labels are case-insensitive
    const label = match[1].toLowerCase();
    // Remove angle brackets if present
    const url = match[2].replace(/^<|>$/g, "");
    // Title is not supported but we capture it in case it will be in the future
    const title = match[3] || "";
    linkDefinitions.set(label, { url, title });
  }

  // Remove all link definitions from the text
  const noLinkDefResult = markdownText.replace(linkDefRegex, "");

  // Replace reference-style links [text][label] with inline links [text](url)
  const refLinkRegex = /\[([^\]]+)\]\s*\[([^\]]*)\]/g;

  return noLinkDefResult.replace(refLinkRegex, (fullMatch, linkText, label) => {
    // If label is empty, use the link text as the label
    const actualLabel = (label || linkText).toLowerCase();

    const linkDef = linkDefinitions.get(actualLabel);
    if (linkDef) {
      // At the moment, we do not support title
      const { url } = linkDef;
      return `[${linkText}](${url})`;
    }

    // If no matching definition found, return original
    return fullMatch;
  });
};

export const sanitizeMarkdownForImages = (
  inputMarkdownContent: string
): string => {
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;

  const reversedMatches: Array<RegExpExecArray> = [];
  // eslint-disable-next-line functional/no-let
  let match: RegExpExecArray | null;
  while ((match = markdownImageRegex.exec(inputMarkdownContent)) !== null) {
    // eslint-disable-next-line functional/immutable-data
    reversedMatches.unshift(match);
  }

  return reversedMatches.reduce(
    (sanitizedMarkdownContent, innerMatch) =>
      insertNewLinesIfNeededOnMatch(sanitizedMarkdownContent, innerMatch),
    inputMarkdownContent
  );
};

const anyWhitespaceCharacterButNewLineSet = new Set([
  " ",
  "\t",
  "\r",
  "\f",
  "\v"
]);

export const insertNewLinesIfNeededOnMatch = (
  markdownContent: string,
  imageMatch: RegExpExecArray
): string => {
  const matchStartIndex = imageMatch.index;
  const matchEndIndex = matchStartIndex + imageMatch[0].length;

  // eslint-disable-next-line functional/no-let
  let endNewLineOccurrences = 0;
  // eslint-disable-next-line functional/no-let
  let j = matchEndIndex;
  while (j < markdownContent.length) {
    const character = markdownContent[j];
    if (character === "\n") {
      endNewLineOccurrences++;
    } else if (!anyWhitespaceCharacterButNewLineSet.has(character)) {
      break;
    }
    j++;
  }
  const newLinesToAddToEnd = "\n".repeat(
    Math.max(0, 2 - endNewLineOccurrences)
  );
  const intermediateMarkdownContent =
    markdownContent.slice(0, matchEndIndex) +
    newLinesToAddToEnd +
    markdownContent.slice(matchEndIndex);

  // eslint-disable-next-line functional/no-let
  let startNewLineOccurrences = 0;
  // eslint-disable-next-line functional/no-let
  let i = Math.max(0, matchStartIndex - 1);
  while (i >= 0) {
    const character = intermediateMarkdownContent[i];
    if (character === "\n") {
      startNewLineOccurrences++;
    } else if (!anyWhitespaceCharacterButNewLineSet.has(character)) {
      break;
    }
    i--;
  }
  const newLinesToAddToStart = "\n".repeat(
    Math.max(0, 2 - startNewLineOccurrences)
  );
  return (
    intermediateMarkdownContent.slice(0, matchStartIndex) +
    newLinesToAddToStart +
    intermediateMarkdownContent.slice(matchStartIndex)
  );
};

export const isTxtParentNode = (node: TxtNode): node is TxtParentNode =>
  node.type === "Paragraph" ||
  node.type === "Header" ||
  node.type === "BlockQuote" ||
  node.type === "List" ||
  node.type === "ListItem" ||
  node.type === "Table" ||
  node.type === "TableRow" ||
  node.type === "TableCell" ||
  node.type === "Emphasis" ||
  node.type === "Strong" ||
  node.type === "Delete" ||
  node.type === "Link";
export const isTxtLinkNode = (node: TxtNode): node is TxtLinkNode =>
  node.type === "Link";
export const isTxtStrNode = (node: TxtNode): node is TxtStrNode =>
  node.type === "Str";
export const isTxtParagraphNode = (node: TxtNode): node is TxtParagraphNode =>
  node.type === "Paragraph";

export type LinkData = {
  text: string;
  url: string;
};

export const extractAllLinksFromRootNode = (
  node: TxtHeaderNode | TxtListNode | TxtParagraphNode,
  screenReaderEnabled: boolean
): ReadonlyArray<LinkData> => {
  const allLinkData: Array<LinkData> = [];
  if (node.parent?.type === "Document" && isIos && screenReaderEnabled) {
    extractAllLinksFromNodeWithChildren(node, allLinkData);
  }
  return allLinkData;
};

export const extractAllLinksFromNodeWithChildren = (
  nodeWithChildren: Readonly<TxtParentNode>,
  allLinks: Array<LinkData>
) => {
  nodeWithChildren.children.forEach(node => {
    if (isTxtLinkNode(node)) {
      const composedLink: Array<string> = [];
      extractLinkDataFromRootNode(node, composedLink);
      const text = composedLink.join("");
      const url = node.url;
      // eslint-disable-next-line functional/immutable-data
      allLinks.push({
        text,
        url
      });
    } else if (isTxtParentNode(node)) {
      extractAllLinksFromNodeWithChildren(node, allLinks);
    }
  });
};

export const extractLinkDataFromRootNode = (
  inputNode: Readonly<TxtParentNode>,
  links: Array<string>
): void =>
  inputNode.children.forEach(node => {
    if (isTxtStrNode(node)) {
      // eslint-disable-next-line functional/immutable-data
      links.push(node.value);
    } else if (isTxtParentNode(node)) {
      extractLinkDataFromRootNode(node, links);
    }
  });

export const isParagraphNodeInHierarchy = (
  input: TxtNode | undefined
): boolean => {
  if (input == null || input.parent == null) {
    return false;
  } else if (isTxtParagraphNode(input)) {
    return true;
  }

  return isParagraphNodeInHierarchy(input.parent);
};
