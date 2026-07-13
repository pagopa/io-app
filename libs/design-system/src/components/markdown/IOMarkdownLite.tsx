import type { TextStyle } from "react-native";
import { IOMarkdown } from "./IOMarkdown";
import { LITE_DISABLED_TYPES } from "./parser";

export type IOMarkdownLiteProps = {
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
};

/**
 * Lightweight markdown component supporting only paragraphs, bold, italic,
 * links, and line breaks.
 *
 * This is a thin wrapper around `IOMarkdown` with extra node types (headings,
 * lists, blockquotes, images, code, horizontal rules, and HTML) disabled.
 */
export const IOMarkdownLite = (props: IOMarkdownLiteProps) => (
  <IOMarkdown {...props} disabledRules={LITE_DISABLED_TYPES} />
);
