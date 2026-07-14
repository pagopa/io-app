import { View } from "react-native";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core";
import { BodyMonospace } from "../typography/BodyMonospace";

type CodeBlockProps = {
  content: string;
};

/**
 * Theme-aware code block with a subtle background and border,
 * similar to GitHub's fenced code block styling.
 */
export const CodeBlock = ({ content }: CodeBlockProps) => {
  const theme = useIOTheme();

  return (
    <View
      style={{
        backgroundColor: IOColors[theme["appBackground-secondary"]],
        borderColor: IOColors[theme["cardBorder-default"]],
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
