import { IOColors, IOVisualCostants, useIOTheme } from "@io-app/design-system";
import { useLinkTo } from "@react-navigation/native";
import { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import IOMarkdown from "../../../../components/IOMarkdown";
import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";
import { trackAppCaughtError } from "../../../../utils/analytics";
import { unknownToString } from "../../../../utils/errors";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault,
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

    const renderContent = () => (
      <IOMarkdown
        content={content}
        onError={(error, _stack) => {
          const errorString = unknownToString(error);
          trackAppCaughtError(
            "CardWithMarkdownContent",
            "Unable to render service's markdown",
            errorString
          );
        }}
        rules={generateMessagesAndServicesRules(linkTo)}
      />
    );

    return <CardWrapper>{renderContent()}</CardWrapper>;
  }
);

const CardWithMarkdownContentSkeleton = () => (
  <CardWrapper>
    <LoadingSkeleton />
  </CardWrapper>
);

export { CardWithMarkdownContent, CardWithMarkdownContentSkeleton };
