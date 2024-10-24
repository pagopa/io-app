import React, { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { Markdown } from "../../../../components/ui/Markdown/Markdown";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 24
  }
});

export type CardWithMarkdownContentProps = {
  content: string;
};

const CSS_STYLE = `
  body {
    line-height: 1.5;
  }
`;

const CardWrapper = ({ children }: { children: ReactNode }) => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: IOColors[theme["appBackground-primary"]],
          borderColor: IOColors[theme["cardBorder-default"]]
        }
      ]}
    >
      {children}
    </View>
  );
};

const CardWithMarkdownContent = memo(
  ({ content }: CardWithMarkdownContentProps) => (
    <CardWrapper>
      <Markdown cssStyle={CSS_STYLE}>{content}</Markdown>
    </CardWrapper>
  )
);

const CardWithMarkdownContentSkeleton = () => (
  <CardWrapper>
    <LoadingSkeleton />
  </CardWrapper>
);

export { CardWithMarkdownContent, CardWithMarkdownContentSkeleton };
