import React, { memo, useMemo } from "react";
import { View } from "react-native";
import IOMarkdownRenderer from "./IOMarkdownRenderer";
import { IOMarkdownRules } from "./types";

type Props = {
  content: string;
  rules?: IOMarkdownRules;
};

const IOMarkdown = ({ content, rules }: Props) => {
  const markdownContent = useMemo(() => {
    const markdownRenderer = new IOMarkdownRenderer(rules);
    const parsedContent = markdownRenderer.parse(content);

    return parsedContent.map(markdownRenderer.render);
  }, [rules, content]);

  return <View>{markdownContent}</View>;
};
export default memo(IOMarkdown);
