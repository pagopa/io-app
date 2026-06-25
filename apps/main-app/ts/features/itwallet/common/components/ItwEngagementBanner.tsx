import {
  BodySmall,
  H4,
  IconButton,
  IOButton,
  VSpacer,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { TxtParagraphNode, TxtStrongNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import { ComponentProps, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import ItWalletDeck from "../../../../../img/features/itWallet/brand/itw_deck_engagement.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { ItwBrandedBox } from "./ItwBrandedBox";
import { PoweredByItWalletText } from "./PoweredByItWalletText";

type Props = {
  action: string;
  description: string;
  dismissable?: boolean;
  onDismiss: () => void;
  // Events
  onPress: () => void;
  // Styles
  style?: ComponentProps<typeof View>["style"];
  // Content
  title: string;
};

export const ItwEngagementBanner = ({
  testID,
  title,
  description,
  action,
  dismissable,
  onPress,
  onDismiss,
  style
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
      // A11y related props
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"button"}
      accessible={true}
      onAccessibilityTap={onPress}
      // Styles
      style={style}
      testID={testID}
    >
      <ItwBrandedBox borderRadius={8}>
        <ItWalletDeck height={145} style={styles.deck} width={105} />
        <VStack space={8}>
          <View style={styles.header}>
            <H4 style={styles.content}>{title}</H4>
            {dismissable && (
              <IconButton
                accessibilityLabel={I18n.t("global.buttons.close")}
                color="contrast"
                icon="closeMedium"
                onPress={onDismiss}
                testID="itwEngagementBannerCloseButtonTestID"
              />
            )}
          </View>
          <View style={styles.content}>
            <IOMarkdown content={description} rules={markdownRules} />
          </View>
          <PoweredByItWalletText />
        </VStack>
        <VSpacer size={8} />
        <IOButton
          color="primary"
          label={action}
          onPress={onPress}
          testID="itwEngagementBannerActionButtonTestID"
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
