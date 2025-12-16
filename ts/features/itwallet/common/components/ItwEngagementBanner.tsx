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
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import ItWalletDeck from "../../../../../img/features/itWallet/brand/itw_deck_engagement.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { ItwBrandedBox } from "./ItwBrandedBox";
import { PoweredByItWalletText } from "./PoweredByItWalletText";

export type ItwEngagementBannerVariant =
  | "activation"
  | "upgrade"
  | "upgrade_empty"
  | "upgrade_expiring";

type Props = {
  title: string;
  description: string;
  action: string;
  onActionPress: () => void;
  onClosePress: () => void;
};

export const ItwEngagementBanner = (props: WithTestID<Props>) => {
  const { testID, title, description, action, onActionPress, onClosePress } =
    props;

  const handleOnClosePress = useCallback(() => {
    Alert.alert(
      I18n.t("features.itWallet.engagementBanner.dismissAlert.title"),
      I18n.t("features.itWallet.engagementBanner.dismissAlert.description"),
      [
        {
          text: I18n.t(
            "features.itWallet.engagementBanner.dismissAlert.cancel"
          ),
          onPress: constNull
        },
        {
          text: I18n.t(
            "features.itWallet.engagementBanner.dismissAlert.confirm"
          ),
          style: "destructive",
          onPress: onClosePress
        }
      ]
    );
  }, [onClosePress]);

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
      onAccessibilityTap={onActionPress}
    >
      <ItwBrandedBox>
        <ItWalletDeck width={105} height={145} style={styles.deck} />
        <VStack space={8}>
          <View style={styles.header}>
            <H4 color="black" style={styles.content}>
              {title}
            </H4>
            <IconButton
              color="contrast"
              accessibilityLabel="close"
              icon="closeMedium"
              onPress={handleOnClosePress}
            />
          </View>
          <View style={styles.content}>
            <IOMarkdown rules={markdownRules} content={description} />
          </View>
          <PoweredByItWalletText />
        </VStack>
        <VSpacer size={8} />
        <IOButton
          color="primary"
          label={action}
          onPress={onActionPress}
          fullWidth
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
