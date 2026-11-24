import { View } from "react-native";

import { useIOColors } from "../../context";
import { BodyMonospace } from "../typography/BodyMonospace";

type CodeBlockProps = {
  content: string;
};

/**
 * Theme-aware code block with a subtle background and border, similar to
 * GitHub's fenced code block styling.
 */
export const CodeBlock = ({ content }: CodeBlockProps) => {
  const codeBlockColors = useIOColors().component.codeBlock;

  return (
    <View
      style={{
        backgroundColor: codeBlockColors.background,
        borderColor: codeBlockColors.border,
        borderWidth: 1,
        borderRadius: 4,
        borderCurve: "continuous",
        paddingHorizontal: 16,
        paddingVertical: 12
      }}
    >
      <BodyMonospace>{content}</BodyMonospace>
    </View>
  );
};
