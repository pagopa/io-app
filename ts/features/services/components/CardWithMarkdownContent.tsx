import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { Markdown } from "../../../components/ui/Markdown/Markdown";
import { LoadingSkeleton } from "../../../components/ui/Markdown/LoadingSkeleton";

const styles = StyleSheet.create({
  card: {
    backgroundColor: IOColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
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

const CardWithMarkdownContent = memo(
  ({ content }: CardWithMarkdownContentProps) => (
    <View style={styles.card}>
      <Markdown cssStyle={CSS_STYLE}>{content}</Markdown>
    </View>
  )
);

const CardWithMarkdownContentSkeleton = () => (
  <View style={styles.card}>
    <LoadingSkeleton />
  </View>
);

export { CardWithMarkdownContent, CardWithMarkdownContentSkeleton };
