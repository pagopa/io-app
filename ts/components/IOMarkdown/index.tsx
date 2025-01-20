import { memo } from "react";
import { View } from "react-native";
import { IOMarkdownRenderRules } from "./types";
import { getRenderMarkdown, parse } from "./markdownRenderer";
import { DEFAULT_RULES } from "./renderRules";

type Props = {
  /**
   * The `markdown` string to render.
   */
  content: string;
  /**
   * The render rules that can be used to override the `DEFAULT_RULES`.
   */
  rules?: Partial<IOMarkdownRenderRules>;
};

/**
 * This component parses a markdown string and render it using the `DS` components.
 *
 * It's possible to override every single rule by passing a custom `rules` object.
 */
const IOMarkdown = ({ content, rules }: Props) => {
  const parsedContent = parse(content);
  const renderMarkdown = getRenderMarkdown({
    ...DEFAULT_RULES,
    ...(rules || {})
  });

  return <View>{parsedContent.map(renderMarkdown)}</View>;
};
export default memo(IOMarkdown);
