import type React from "react";
import type { TextStyle } from "react-native";
import type { IOColors } from "../../core";

/**
 * All supported markdown node types.
 */
export type MarkdownNodeType =
  /* Headings */
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  /* Inline */
  | "paragraph"
  | "text"
  | "strong"
  | "em"
  | "link"
  | "softbreak"
  | "hardbreak"
  /* Lists */
  | "bullet_list"
  | "ordered_list"
  | "list_item"
  /* Block-level */
  | "blockquote"
  | "image"
  | "code_inline"
  | "fence"
  | "hr"
  | "html_block"
  | "html_inline";

/**
 * A node in the markdown AST.
 */
export type MarkdownNode = {
  type: MarkdownNodeType;
  key: string;
  content?: string;
  attributes?: Record<string, string>;
  children: ReadonlyArray<MarkdownNode>;
  /** List metadata: whether the list is ordered */
  ordered?: boolean;
  /** Number of ancestor lists wrapping this node */
  listDepth?: number;
};

export type RenderContext = {
  onLinkPress?: (url: string) => void;
  linkColor: IOColors;
  /** Applied to paragraph */
  textAlign: TextStyle["textAlign"];
  /** Applied to paragraph segments */
  fontSize: TextStyle["fontSize"];
  lineHeight: TextStyle["lineHeight"];
};

export type RenderChildrenFn = (
  nodes: ReadonlyArray<MarkdownNode>
) => ReadonlyArray<React.ReactNode>;

/**
 * A render rule receives a node, a function to recursively render children,
 * and the current render context.
 */
export type RenderRule = (
  node: MarkdownNode,
  renderChildren: RenderChildrenFn,
  context: RenderContext
) => React.ReactNode;

/**
 * Partial record of render rules. Only the provided keys override the defaults.
 */
export type IOMarkdownRenderRules = Partial<
  Record<MarkdownNodeType, RenderRule>
>;
