import { useCallback, useMemo } from "react";
import { Linking, type TextStyle, View } from "react-native";
import { useIOTheme } from "../../context";
import {
  bodyFontSize,
  bodyLineHeight,
  bodySmallFontSize,
  bodySmallLineHeight
} from "../typography";
import { parse } from "./parser";
import { DEFAULT_RULES } from "./rules";
import type {
  IOMarkdownRenderRules,
  MarkdownNode,
  MarkdownNodeType,
  RenderContext,
  RenderRule
} from "./types";

export type IOMarkdownProps = {
  /** The markdown string to render */
  content: string;
  /** Override default link press behavior. Default: Linking.openURL(url) */
  onLinkPress?: (url: string) => void;
  /** Paragraph alignment. Default: "auto" */
  textAlign?: TextStyle["textAlign"];
  /** Override default text size */
  small?: boolean;
  /** Test ID for the container View */
  testID?: string;
  /** Node types to disable (parser will skip them entirely) */
  disabledRules?: ReadonlyArray<MarkdownNodeType>;
  /** Override individual render rules */
  rules?: IOMarkdownRenderRules;
};

/**
 * Full-featured markdown component that renders markdown content
 * using design system primitives.
 *
 * @remarks
 * This component is still experimental. Check that it is correctly
 * formatting your text before proceeding to use it.
 *
 * Supports headings, paragraphs, bold, italic, links, lists,
 * blockquotes (as Banner), images, code, horizontal rules, and HTML breaks.
 *
 * Individual node types can be disabled via `disabledRules`, and
 * render rules can be overridden via the `rules` prop.
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
      linkColor: theme["interactiveElem-default"],
      textAlign: textAlign ?? "auto",
      fontSize: small ? bodySmallFontSize : bodyFontSize,
      lineHeight: small ? bodySmallLineHeight : bodyLineHeight
    }),
    [handleLinkPress, textAlign, small, theme]
  );

  const mergedRules = useMemo<Record<MarkdownNodeType, RenderRule>>(
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
