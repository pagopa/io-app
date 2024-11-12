import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";
import IOMarkdown from "../../../../components/IOMarkdown";
import { generateMessagesAndServicesRules } from "../../../../components/IOMarkdown/customRules";

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

const CardWithMarkdownContent = memo(
  ({ content }: CardWithMarkdownContentProps) => {
    const linkTo = useLinkTo();

    return (
      <View style={styles.card}>
        <IOMarkdown
          content={content}
          rules={generateMessagesAndServicesRules(linkTo)}
        />
      </View>
    );
  }
);

const CardWithMarkdownContentSkeleton = () => (
  <View style={styles.card}>
    <LoadingSkeleton />
  </View>
);

export { CardWithMarkdownContent, CardWithMarkdownContentSkeleton };
