import { parse as textLintParse } from "@textlint/markdown-to-ast";
import { AnyTxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { omit } from "lodash";
import { AnyTxtNodeWithSpacer, IOMarkdownRenderRules, Renderer } from "./types";

/**
 *
 * @param rules The `markdown` render rules.
 * @returns A render function for the individual node that applies the provided rendering rules.
 */
export function getRenderMarkdown(rules: IOMarkdownRenderRules): Renderer {
  return (content: AnyTxtNodeWithSpacer) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rules[content.type]?.(content, getRenderMarkdown(rules)) ?? null;
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
    reversedMatches.push(match);
  }
  // eslint-disable-next-line functional/immutable-data
  reversedMatches.reverse();

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
