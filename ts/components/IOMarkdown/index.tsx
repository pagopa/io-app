import React, { useMemo } from "react";
import { View } from "react-native";
import IOMarkdownRenderer from "./IOMarkdownRenderer";
import { IOMarkdownRules } from "./types";

type Props = {
  content: string;
  rules?: IOMarkdownRules;
};

const IOMarkdown = ({ content, rules }: Props) => {
  const markdownRenderer = useMemo(
    () => new IOMarkdownRenderer(rules),
    [rules]
  );
  const parsedContent = markdownRenderer.parse(content);

  return <View>{parsedContent.map(markdownRenderer.render)}</View>;
};
export default IOMarkdown;
