import {
  BodySmall,
  H4,
  IconButton,
  IOButton,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { TxtParagraphNode, TxtStrongNode } from "@textlint/ast-node-types";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { AccessibilityRole, Alert, StyleSheet, View } from "react-native";
import ItWalletDeck from "../../../../../img/features/itWallet/brand/deck-4.svg";
import ItWalletLogo from "../../../../../img/features/itWallet/brand/logo.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { IT_WALLET_BG_COLOR_LIGHT, ITW_BRAND_COLORS } from "../utils/constants";

export type ItwEngagementBannerVariant =
  | "activation"
  | "upgrade"
  | "upgrade_empty"
  | "upgrade_expiring";

type Props = {
  onPress: () => void;
  onClosePress: () => void;
  variant: ItwEngagementBannerVariant;
  // A11y related props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
};

export const ItwEngagementBanner = (props: WithTestID<Props>) => {
  const { testID, onPress, onClosePress } = props;

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

  return (
    <View
      testID={testID}
      style={styles.container}
      // A11y related props
      accessible={true}
      accessibilityRole="button"
      onAccessibilityTap={onPress}
    >
      <ItWalletDeck width={"40%"} height={"80%"} style={styles.deck} />
      <StaticContent {...props} onClosePress={handleOnClosePress} />
    </View>
  );
};

const StaticContent = (props: Props) => {
  const {
    variant,
    onPress,
    onClosePress,
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole
  } = props;

  const i18nNamespace = "features.itWallet.engagementBanner";
  const title = I18n.t(`${i18nNamespace}.${variant}.title`);
  const description = I18n.t(`${i18nNamespace}.${variant}.description`);
  const action = I18n.t(`${i18nNamespace}.${variant}.action`);

  // Generates a complete fallbackAccessibilityLabel by concatenating the title, content, and action
  // if they are present. Removes markdown formatting characters like asterisks.
  const fallbackAccessibilityLabel = [title, description, action]
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
      accessible={true}
      // A11y related props
      accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={action !== undefined ? accessibilityRole : "text"}
    >
      <VStack space={16}>
        <View style={styles.logo}>
          <ItWalletLogo width={118} height={24} />
          <IconButton
            color="contrast"
            accessibilityLabel="close"
            icon="closeLarge"
            onPress={onClosePress}
          />
        </View>
        <H4 color="black" style={styles.title}>
          {title}
        </H4>
        <IOMarkdown rules={markdownRules} content={description} />
        <IOButton color="primary" label={action} onPress={onPress} fullWidth />
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IT_WALLET_BG_COLOR_LIGHT,
    display: "flex",
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ITW_BRAND_COLORS.blue
  },
  deck: {
    position: "absolute",
    right: 0,
    height: 0
  },
  logo: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    width: "80%"
  }
});
