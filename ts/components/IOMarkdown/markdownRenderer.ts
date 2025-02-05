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

export const insertNewLinesIfNeededOnMatch = (
  markdownContent: string,
  imageMatch: RegExpExecArray
): string => {
  const matchStartIndex = imageMatch.index;
  const matchEndIndex = matchStartIndex + imageMatch[0].length;
  const sanitizedMarkdownContent = insertNewLineAtIndexIfNeeded(
    markdownContent,
    matchEndIndex
  );
  return insertNewLineAtIndexIfNeeded(
    sanitizedMarkdownContent,
    matchStartIndex - 1,
    true
  );
};

const insertNewLineAtIndexIfNeeded = (
  markdownContent: string,
  baseIndex: number,
  insertAfterIndex: boolean = false
) => {
  if (baseIndex >= 0 && baseIndex < markdownContent.length) {
    const character = markdownContent[baseIndex];
    if (character !== "\n") {
      const index = insertAfterIndex ? baseIndex + 1 : baseIndex;
      return [
        markdownContent.slice(0, index),
        "\n\n",
        markdownContent.slice(index)
      ].join("");
    }
  }
  return markdownContent;
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
