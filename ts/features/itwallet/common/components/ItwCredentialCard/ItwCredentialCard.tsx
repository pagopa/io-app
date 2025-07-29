import { HStack, IOText, Tag } from "@pagopa/io-app-design-system";
import Color from "color";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import { itwShouldRenderNewItWalletSelector } from "../../store/selectors";
import {
  getCredentialNameFromType,
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { getThemeColorByCredentialType } from "../../utils/itwStyleUtils";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";
import { CardBackground } from "./CardBackground";
import { DigitalVersionBadge } from "./DigitalVersionBadge";
import { ItwCardValidityCheckMark } from "./ItwCardValidityCheckMark";
import { CardColorScheme } from "./types";

export type ItwCredentialCard = {
  credentialType: string;
  status?: ItwCredentialStatus;
  /**
   * Indicated the auth level of the credential, which is used to determine
   * if the credential is a valid IT Wallet credential.
   * TODO remove once the upgrade flow is removed
   */
  level?: "L2" | "L3";
};

type StyleProps = {
  titleColor: string;
  titleOpacity: number;
  colorScheme: CardColorScheme;
};

export const ItwCredentialCard = ({
  status = "valid",
  credentialType,
  level
}: ItwCredentialCard) => {
  const typefacePreference = useIOSelector(fontPreferenceSelector);
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const needsItwUpgrade = isNewItwRenderable && level !== "L3";

  const borderColorMap = useBorderColorByStatus();

  const statusTagProps = useMemo<Tag | undefined>(() => {
    if (needsItwUpgrade) {
      return {
        variant: "info",
        text: I18n.t("features.itWallet.card.status.upgradePending")
      };
    }

    return tagPropsByStatus[status];
  }, [status, needsItwUpgrade]);

  const { titleColor, titleOpacity, colorScheme } = useMemo<StyleProps>(() => {
    const isValid = validCredentialStatuses.includes(status);
    const theme = getThemeColorByCredentialType(credentialType);

    if (needsItwUpgrade) {
      return {
        titleColor: theme.textColor,
        titleOpacity: 0.5,
        colorScheme: "faded"
      };
    }

    if (status === "unknown") {
      return {
        titleColor: Color(theme.textColor).grayscale().hex(),
        titleOpacity: 0.5,
        colorScheme: "greyscale"
      };
    }

    if (isValid) {
      return {
        titleColor: theme.textColor,
        titleOpacity: 1,
        colorScheme: "default"
      };
    }

    return {
      titleColor: theme.textColor,
      titleOpacity: 0.5,
      colorScheme: "faded"
    };
  }, [credentialType, status, needsItwUpgrade]);

  return (
    <View style={styles.cardContainer}>
      <CardBackground
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={styles.header}>
        <HStack space={16}>
          <IOText
            size={16}
            lineHeight={20}
            font={
              typefacePreference === "comfortable"
                ? "Titillio"
                : "TitilliumSansPro"
            }
            weight="Semibold"
            maxFontSizeMultiplier={1.25}
            style={{
              letterSpacing: 0.25,
              color: titleColor,
              opacity: titleOpacity,
              flex: 1,
              flexShrink: 1
            }}
          >
            {getCredentialNameFromType(credentialType, "").toUpperCase()}
          </IOText>
          {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
          {!statusTagProps && isNewItwRenderable && (
            <ItwCardValidityCheckMark />
          )}
        </HStack>
      </View>
      <DigitalVersionBadge
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={[styles.border, { borderColor: borderColorMap[status] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 2,
    zIndex: 11
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
