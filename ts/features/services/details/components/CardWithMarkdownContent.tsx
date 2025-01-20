import { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";
import IOMarkdown from "../../../../components/IOMarkdown";
import { generateMessagesAndServicesRules } from "../../../../components/IOMarkdown/customRules";

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
  ({ content }: CardWithMarkdownContentProps) => {
    const linkTo = useLinkTo();

    return (
      <CardWrapper>
        <IOMarkdown
          content={content}
          rules={generateMessagesAndServicesRules(linkTo)}
        />
      </CardWrapper>
    );
  }
);

const CardWithMarkdownContentSkeleton = () => (
  <CardWrapper>
    <LoadingSkeleton />
  </CardWrapper>
);

export { CardWithMarkdownContent, CardWithMarkdownContentSkeleton };
