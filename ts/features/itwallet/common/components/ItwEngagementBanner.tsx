import {
  BodySmall,
  H4,
  IconButton,
  IOButton,
  IOButtonProps,
  VSpacer,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { TxtParagraphNode, TxtStrongNode } from "@textlint/ast-node-types";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import ItWalletDeck from "../../../../../img/features/itWallet/brand/itw_deck_engagement.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { ItwBrandedBox } from "./ItwBrandedBox";
import { PoweredByItWalletText } from "./PoweredByItWalletText";

type Props = {
  // Content
  title: string;
  description: string;
  action: string;
  dismissable?: boolean;
  // Events
  onPress: () => void;
  onDismiss: () => void;
  // Variants
  variant?: IOButtonProps["variant"];
};

export const ItwEngagementBanner = ({
  testID,
  title,
  description,
  action,
  dismissable,
  onPress,
  onDismiss,
  variant
}: WithTestID<Props>) => {
  // Generates a complete fallbackAccessibilityLabel by concatenating the title, content, and action
  // if they are present. Removes markdown formatting characters like asterisks.
  const accessibilityLabel = [title, description, action]
    .filter(Boolean)
    .join("\n")
    .replace(/\*/g, "");

  const markdownRules = useMemo(
    () => ({
      Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
        return (
          <BodySmall key={getTxtNodeKey(paragraph)} weight="Regular">
            {paragraph.children.map(render)}
          </BodySmall>
        );
      },
      Strong(strong: TxtStrongNode, render: Renderer) {
        return (
          <BodySmall key={getTxtNodeKey(strong)} weight="Semibold">
            {strong.children.map(render)}
          </BodySmall>
        );
      }
    }),
    []
  );

  return (
    <View
      testID={testID}
      accessible={true}
      // A11y related props
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"button"}
      onAccessibilityTap={onPress}
    >
      <ItwBrandedBox borderRadius={8}>
        <ItWalletDeck width={105} height={145} style={styles.deck} />
        <VStack space={8}>
          <View style={styles.header}>
            <H4 color="black" style={styles.content}>
              {title}
            </H4>
            {dismissable && (
              <IconButton
                testID="itwEngagementBannerCloseButtonTestID"
                color="contrast"
                accessibilityLabel="close"
                icon="closeMedium"
                onPress={onDismiss}
              />
            )}
          </View>
          <View style={styles.content}>
            <IOMarkdown rules={markdownRules} content={description} />
          </View>
          <PoweredByItWalletText />
        </VStack>
        <VSpacer size={8} />
        <IOButton
          variant={variant}
          testID="itwEngagementBannerActionButtonTestID"
          color="primary"
          label={action}
          onPress={onPress}
        />
      </ItwBrandedBox>
    </View>
  );
};

const styles = StyleSheet.create({
  deck: {
    position: "absolute",
    right: -8,
    height: 0
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  content: {
    width: "80%"
  }
});
