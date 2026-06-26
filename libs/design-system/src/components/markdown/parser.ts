import MarkdownIt, { Token } from "markdown-it";
import { pipe } from "../../utils/pipe";
import { MarkdownNode, MarkdownNodeType } from "./types";

/* Two markdown-it instances: lite (no HTML) and full (HTML enabled) */
const mdLite = MarkdownIt({ html: false, typographer: false, linkify: false });
const mdFull = MarkdownIt({ html: true, typographer: false, linkify: false });

/**
 * Creates a zero-dependency key generator for the markdown AST.
 *
 * These keys are only used as local React render keys, so they do not need
 * cryptographic randomness or an external package: a per-parse incrementing
 * counter is sufficient for our needs.
 */
const createKeyFactory = () => {
  // eslint-disable-next-line functional/no-let
  let keyCounter = 0;

  return (prefix: string) => `md_${prefix}_${keyCounter++}`;
};

/**
 * Complete set of all supported node types.
 */
const ALL_TYPES = new Set<string>([
  /* lite types */
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "paragraph",
  "text",
  "strong",
  "em",
  "link",
  "softbreak",
  "hardbreak",
  /* full types */
  "bullet_list",
  "ordered_list",
  "list_item",
  "blockquote",
  "image",
  "code_inline",
  "fence",
  "hr",
  "html_block",
  "html_inline"
]);

/**
 * The types disabled when using IOMarkdownLite.
 */
export const LITE_DISABLED_TYPES: ReadonlyArray<MarkdownNodeType> = [
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "bullet_list",
  "ordered_list",
  "list_item",
  "blockquote",
  "image",
  "code_inline",
  "fence",
  "hr",
  "html_block",
  "html_inline"
];

/**
 * Maps a markdown-it token type to a MarkdownNodeType.
 * Normalizes `*_open` / `*_close` suffixes and heading tags.
 * Returns undefined for unsupported or disabled types.
 */
const getNodeType = (
  token: Token,
  enabledTypes: Set<string>
): MarkdownNodeType | undefined => {
  const cleanedType = token.type.replace(/_open|_close/g, "");

  const type =
    cleanedType === "heading"
      ? `${cleanedType}${token.tag.slice(1)}`
      : cleanedType;

  return enabledTypes.has(type) ? (type as MarkdownNodeType) : undefined;
};

/**
 * Flattens nested inline tokens into the parent token stream.
 * markdown-it wraps inline content in `inline` tokens with children.
 */
const flattenInline = (tokens: ReadonlyArray<Token>): ReadonlyArray<Token> =>
  tokens.reduce<ReadonlyArray<Token>>((acc, token) => {
    if (
      token.type === "inline" &&
      token.children &&
      token.children.length > 0
    ) {
      return [...acc, ...flattenInline(token.children)];
    }
    return [...acc, token];
  }, []);

/**
 * Converts a flat array of tokens into a hierarchical AST,
 * skipping disabled/unsupported token types entirely.
 */
const tokensToAST = (
  tokens: ReadonlyArray<Token>,
  enabledTypes: Set<string>,
  getKey: (prefix: string) => string
): Array<MarkdownNode> => {
  if (!tokens || tokens.length === 0) {
    return [];
  }

  const parseFrom = (index: number): [Array<MarkdownNode>, number] => {
    if (index >= tokens.length) {
      return [[], index];
    }

    const token = tokens[index];
    const nodeType = getNodeType(token, enabledTypes);

    // Closing token — stop and return to caller
    if (token.nesting === -1) {
      return [[], index + 1];
    }

    // Unsupported / disabled type — skip it
    if (nodeType === undefined) {
      if (token.nesting === 1) {
        // Opening token: skip ahead to matching close
        const findMatchingClose = (pos: number, depth: number): number =>
          pos >= tokens.length || depth === 0
            ? pos
            : findMatchingClose(pos + 1, depth + tokens[pos].nesting);
        return parseFrom(findMatchingClose(index + 1, 1));
      }
      // Self-closing / inline token: skip single token
      return parseFrom(index + 1);
    }

    // Skip empty text nodes
    if (nodeType === "text" && token.content === "") {
      return parseFrom(index + 1);
    }

    const attributes = token.attrs?.reduce<Record<string, string>>(
      (prev, [name, value]) => ({ ...prev, [name]: value }),
      {}
    );

    const node: MarkdownNode = {
      type: nodeType,
      key: getKey(nodeType),
      content: token.content || undefined,
      attributes: attributes || undefined,
      children: [],
      // Preserve ordered flag for lists
      ...(nodeType === "ordered_list" ? { ordered: true } : {}),
      ...(nodeType === "bullet_list" ? { ordered: false } : {}),
      // Preserve image src and alt via attributes
      ...(nodeType === "image"
        ? {
            attributes: {
              ...attributes,
              src: token.attrGet?.("src") ?? attributes?.src ?? "",
              alt: token.content ?? ""
            }
          }
        : {})
    };

    if (token.nesting === 1) {
      // Opening token — parse children
      const [childNodes, nextIndex] = parseFrom(index + 1);

      const nodeWithChildren: MarkdownNode = {
        ...node,
        children: childNodes
      };
      const [restNodes, finalIndex] = parseFrom(nextIndex);
      return [[nodeWithChildren, ...restNodes], finalIndex];
    }

    // Self-closing / inline token (nesting === 0)
    const [restNodes, finalIndex] = parseFrom(index + 1);
    return [[node, ...restNodes], finalIndex];
  };

  const [nodes] = parseFrom(0);
  return nodes;
};

/**
 * Lifts image nodes out of paragraph containers so they become
 * top-level siblings.  markdown-it always wraps images inside
 * paragraphs; this post-processing step ensures the existing
 * `imageRule` is actually invoked during rendering.
 *
 * - Paragraph with **only** image children → replaced by the images.
 * - Paragraph with a **mix** of text and images → split into
 *   alternating paragraph (text run) and standalone image nodes.
 * - Paragraphs without images → unchanged.
 */
const liftImages = (
  nodes: ReadonlyArray<MarkdownNode>,
  getKey: (prefix: string) => string
): Array<MarkdownNode> =>
  nodes.flatMap(node => {
    if (node.type !== "paragraph") {
      return [node];
    }

    const hasImage = node.children.some(c => c.type === "image");
    if (!hasImage) {
      return [node];
    }

    // Every child is an image → lift them all out
    const allImages = node.children.every(c => c.type === "image");
    if (allImages) {
      // Return images as top-level nodes (they keep their own keys)
      return [...node.children];
    }

    // Mixed content: split children into text runs and standalone images.
    // A single reduce accumulates finished nodes and the current text run;
    // a trailing text run is flushed after the fold.
    type Acc = {
      readonly result: ReadonlyArray<MarkdownNode>;
      readonly textRun: ReadonlyArray<MarkdownNode>;
    };

    const wrapTextRun = (run: ReadonlyArray<MarkdownNode>): MarkdownNode => ({
      ...node,
      key: getKey("paragraph"),
      children: run
    });

    const { result, textRun } = node.children.reduce<Acc>(
      (acc, child) =>
        child.type === "image"
          ? {
              result: [
                ...acc.result,
                ...(acc.textRun.length > 0 ? [wrapTextRun(acc.textRun)] : []),
                child
              ],
              textRun: []
            }
          : { ...acc, textRun: [...acc.textRun, child] },
      { result: [], textRun: [] }
    );

    return textRun.length > 0 ? [...result, wrapTextRun(textRun)] : [...result];
  });

const annotateListDepth = (
  nodes: ReadonlyArray<MarkdownNode>,
  parentListDepth = 0
): Array<MarkdownNode> =>
  nodes.map(node => {
    const listDepth = parentListDepth;
    const childListDepth =
      node.type === "bullet_list" || node.type === "ordered_list"
        ? parentListDepth + 1
        : parentListDepth;

    return {
      ...node,
      listDepth,
      children: annotateListDepth(node.children, childListDepth)
    };
  });

/**
 * Computes the enabled types set from the full set minus disabled types.
 */
const getEnabledTypes = (
  disabledTypes?: ReadonlyArray<string>
): Set<string> => {
  if (!disabledTypes || disabledTypes.length === 0) {
    return ALL_TYPES;
  }
  const disabled = new Set(disabledTypes);
  return new Set([...ALL_TYPES].filter(t => !disabled.has(t)));
};

/**
 * Parses a markdown source string into an AST.
 * @param source The markdown string.
 * @param disabledTypes Node types to exclude from parsing.
 * @returns Array of MarkdownNode.
 */
export const parse = (
  source: string,
  disabledTypes?: ReadonlyArray<MarkdownNodeType>
): Array<MarkdownNode> => {
  const enabledTypes = getEnabledTypes(disabledTypes);
  const needsHtml =
    enabledTypes.has("html_block") || enabledTypes.has("html_inline");
  const md = needsHtml ? mdFull : mdLite;
  const getKey = createKeyFactory();

  return pipe(
    // 1. Tokenize the markdown source using markdown-it
    md.parse(source, {}),
    // 2. Unwrap nested inline tokens into a flat token stream
    flattenInline,
    // 3. Convert the flat token stream into a hierarchical AST
    tokens => tokensToAST(tokens, enabledTypes, getKey),
    // 4. Hoist image nodes out of paragraph wrappers so imageRule is invoked
    nodes => liftImages(nodes, getKey),
    // 5. Drop empty paragraphs left behind by disabled/lifted node types
    nodes => nodes.filter(n => n.type !== "paragraph" || n.children.length > 0),
    // 6. Annotate nodes with their list nesting depth for rendering
    annotateListDepth
  );
};

/**
 * Parses markdown with the lite subset of rules only.
 */
export const parseLite = (source: string): Array<MarkdownNode> =>
  parse(source, LITE_DISABLED_TYPES);
