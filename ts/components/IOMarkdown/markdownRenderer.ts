import { parse as textLintParse } from "@textlint/markdown-to-ast";
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
  return textLintParse(content).children.reduce<Array<AnyTxtNodeWithSpacer>>(
    (acc, currNode, idx, self) => {
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
    },
    []
  );
}
