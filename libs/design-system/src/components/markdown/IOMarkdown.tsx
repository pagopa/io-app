import { useCallback, useMemo } from "react";
import { Linking, type TextStyle, View } from "react-native";

import type {
  IOMarkdownRenderRules,
  MarkdownNode,
  MarkdownNodeType,
  RenderContext
} from "./types";

import { useIOTheme } from "../../context";
import { IOTypographicLinkColorToken, IOTypography } from "../../core";
import { parse } from "./parser";
import { DEFAULT_RULES } from "./rules";

const { body, bodySmall } = IOTypography;

export type IOMarkdownProps = {
  /** The markdown string to render */
  content: string;
  /** Node types to disable (parser will skip them entirely) */
  disabledRules?: ReadonlyArray<MarkdownNodeType>;
  /** Override default link press behavior. Default: Linking.openURL(url) */
  onLinkPress?: (url: string) => void;
  /** Override individual render rules */
  rules?: IOMarkdownRenderRules;
  /** Override default text size */
  small?: boolean;
  /** Test ID for the container View */
  testID?: string;
  /** Paragraph alignment. Default: "auto" */
  textAlign?: TextStyle["textAlign"];
};

/**
 * Full-featured markdown component that renders markdown content using design
 * system primitives.
 *
 * @remarks
 *   This component is still experimental. Check that it is correctly formatting
 *   your text before proceeding to use it. Supports headings, paragraphs, bold,
 *   italic, links, lists, blockquotes (as Banner), images, code, horizontal
 *   rules, and HTML breaks. Individual node types can be disabled via
 *   `disabledRules`, and render rules can be overridden via the `rules` prop.
 */
export const IOMarkdown = ({
  content,
  onLinkPress,
  textAlign,
  small,
  testID,
  disabledRules,
  rules = {}
}: IOMarkdownProps) => {
  const theme = useIOTheme();

  const ast = useMemo(
    () => parse(content, disabledRules),
    [content, disabledRules]
  );

  const handleLinkPress = useCallback(
    (url: string) => {
      if (onLinkPress) {
        onLinkPress(url);
      } else {
        Linking.openURL(url).catch(() => null);
      }
    },
    [onLinkPress]
  );

  const context = useMemo<RenderContext>(
    () => ({
      onLinkPress: handleLinkPress,
      linkColor: theme[IOTypographicLinkColorToken],
      textAlign: textAlign ?? "auto",
      fontSize: small ? bodySmall.size : body.size,
      lineHeight: small ? bodySmall.lineHeight : body.lineHeight
    }),
    [handleLinkPress, textAlign, small, theme]
  );

  // Partial, since a caller can blank out a node type via `rules`
  const mergedRules = useMemo<IOMarkdownRenderRules>(
    () => ({ ...DEFAULT_RULES, ...rules }),
    [rules]
  );

  const renderChildren = useCallback(
    (nodes: ReadonlyArray<MarkdownNode>) =>
      nodes.map(node => {
        const rule = mergedRules[node.type];
        return rule ? rule(node, renderChildren, context) : null;
      }),
    [mergedRules, context]
  );

  const rendered = renderChildren(ast);

  return (
    <View style={{ gap: 8 }} testID={testID}>
      {rendered}
    </View>
  );
};
