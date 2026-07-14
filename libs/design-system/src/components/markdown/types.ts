import type React from "react";
import type { TextStyle } from "react-native";

import type { IOColors } from "../../core";

/**
 * Partial record of render rules. Only the provided keys override the defaults.
 */
export type IOMarkdownRenderRules = Partial<
  Record<MarkdownNodeType, RenderRule>
>;

/**
 * A node in the markdown AST.
 */
export type MarkdownNode = {
  attributes?: Record<string, string>;
  children: ReadonlyArray<MarkdownNode>;
  content?: string;
  key: string;
  /** Number of ancestor lists wrapping this node */
  listDepth?: number;
  /** List metadata: whether the list is ordered */
  ordered?: boolean;
  type: MarkdownNodeType;
};

/**
 * All supported markdown node types.
 */
export type MarkdownNodeType =
  /* Headings */
  | "blockquote"
  | "bullet_list"
  | "code_inline"
  | "em"
  | "fence"
  | "hardbreak"
  /* Inline */
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "hr"
  /* Lists */
  | "html_block"
  | "html_inline"
  | "image"
  /* Block-level */
  | "link"
  | "list_item"
  | "ordered_list"
  | "paragraph"
  | "softbreak"
  | "strong"
  | "text";

export type RenderChildrenFn = (
  nodes: ReadonlyArray<MarkdownNode>
) => ReadonlyArray<React.ReactNode>;

export type RenderContext = {
  /** Applied to paragraph segments */
  fontSize: TextStyle["fontSize"];
  lineHeight: TextStyle["lineHeight"];
  linkColor: IOColors;
  onLinkPress?: (url: string) => void;
  /** Applied to paragraph */
  textAlign: TextStyle["textAlign"];
};

/**
 * A render rule receives a node, a function to recursively render children,
 * and the current render context.
 */
export type RenderRule = (
  node: MarkdownNode,
  renderChildren: RenderChildrenFn,
  context: RenderContext
) => React.ReactNode;
