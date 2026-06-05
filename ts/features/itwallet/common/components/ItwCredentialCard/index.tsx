import {
  HStack,
  IOColors,
  IOText,
  Tag,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import Color from "color";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import { useItwDisplayCredentialStatus } from "../../../presentation/details/hooks/useItwDisplayCredentialStatus";
import { useItwCredentialName } from "../../hooks/useItwCredentialName";
import { itwShouldUpgradeCredentialSelector } from "../../store/selectors";
import {
  useBorderColorByStatus,
  useTagPropsByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { CredentialType } from "../../utils/itwMocksUtils";
import { useThemeColorByCredentialType } from "../../utils/itwStyleUtils";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";
import { ItWalletIdLogo } from "../ItWalletIdLogo";
import { CardBackground, LegacyCardBackground } from "./CardBackground";
import { useCredentialCardConfig } from "./config";
import { DigitalVersionBadge } from "./DigitalVersionBadge";
import { CardColorScheme } from "./types";

export type ItwCredentialCard = {
  /**
   * Type of the credential, which is used to determine the visual
   * representation and styling of the card.
   */
  credentialType: string;
  /**
   * Current status of the credential, used to determine the visual
   * representation and the status tag to display.
   */
  credentialStatus?: ItwCredentialStatus;
  /**
   * Issue date of the credential. Used to determine whether the card should
   * display the "upgrade pending" badge when the user owns an L3 PID and the
   * credential was issued before it.
   */
  issuedAt?: string;
};

type StyleProps = {
  titleColor: string;
  titleOpacity: number;
};

export const ItwCredentialCard = memo(
  ({
    credentialType,
    credentialStatus = "valid",
    issuedAt
  }: ItwCredentialCard) => {
    const typefacePreference = useIOSelector(fontPreferenceSelector);
    const needsItwUpgrade = useIOSelector(
      itwShouldUpgradeCredentialSelector(credentialType, issuedAt)
    );
    const { themeType, theme } = useIOThemeContext();
    const status = useItwDisplayCredentialStatus(credentialStatus);
    const borderColorMap = useBorderColorByStatus();
    const cardConfig = useCredentialCardConfig(credentialType);
    const credentialName = useItwCredentialName(credentialType);
    const tagPropsByStatus = useTagPropsByStatus();
    const isValid = validCredentialStatuses.includes(status);

    const statusTagProps = useMemo<Tag | undefined>(() => {
      if (needsItwUpgrade) {
        return {
          variant: "info",
          text: I18n.t("features.itWallet.card.status.upgradePending")
        };
      }

      return tagPropsByStatus[status];
    }, [status, needsItwUpgrade, tagPropsByStatus]);

    const appBackgroundColor = IOColors[theme["appBackground-primary"]];

    return (
      <View
        style={[
          styles.cardWrapper,
          status === "valid" && { boxShadow: `0 0 0 2px ${appBackgroundColor}` }
        ]}
      >
        <View style={styles.cardContainer}>
          <CardBackground {...cardConfig} />
          <View style={styles.header}>
            <HStack space={16}>
              {credentialType === CredentialType.PID ? (
                <View style={{ flex: 1 }}>
                  <ItWalletIdLogo width={117} height={27} />
                </View>
              ) : (
                <IOText
                  size={16}
                  lineHeight={24}
                  font={
                    typefacePreference === "comfortable"
                      ? "Titillio"
                      : "TitilliumSansPro"
                  }
                  weight="Semibold"
                  maxFontSizeMultiplier={1.25}
                  style={{
                    letterSpacing: 0.25,
                    color: cardConfig.titleColor,
                    flex: 1,
                    flexShrink: 1
                  }}
                >
                  {credentialName.toUpperCase()}
                </IOText>
              )}
            </HStack>
            {statusTagProps && (
              <View style={styles.statusTag}>
                <Tag {...statusTagProps} />
              </View>
            )}
          </View>

          {!isValid && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.statusOverlay,
                {
                  backgroundColor:
                    themeType === "light" ? IOColors.white : IOColors.black
                }
              ]}
            />
          )}
          <View
            style={[
              styles.border,
              status === "valid"
                ? { borderColor: cardConfig.borderColor, borderWidth: 1 }
                : { borderColor: borderColorMap[status], borderWidth: 2 }
            ]}
          />
        </View>
      </View>
    );
  }
);

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
export const ItwCredentialCardLegacy = ({
  credentialType,
  credentialStatus = "valid",
  issuedAt
}: ItwCredentialCard) => {
  const typefacePreference = useIOSelector(fontPreferenceSelector);
  const needsItwUpgrade = useIOSelector(
    itwShouldUpgradeCredentialSelector(credentialType, issuedAt)
  );
  const status = useItwDisplayCredentialStatus(credentialStatus);
  const theme = useThemeColorByCredentialType(credentialType);
  const credentialName = useItwCredentialName(credentialType);
  const tagPropsByStatus = useTagPropsByStatus();
  const borderColorMap = useBorderColorByStatus();

  const statusTagProps = useMemo<Tag | undefined>(() => {
    if (needsItwUpgrade) {
      return {
        variant: "info",
        text: I18n.t("features.itWallet.card.status.upgradePending")
      };
    }

    return tagPropsByStatus[status];
  }, [status, needsItwUpgrade, tagPropsByStatus]);

  const { titleColor, titleOpacity, colorScheme } = useMemo<
    StyleProps & { colorScheme: CardColorScheme }
  >(() => {
    // Include "jwtExpired" as a valid status because credentials with this state
    // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
    const isValid = [...validCredentialStatuses, "jwtExpired"].includes(status);
    const baseColor = theme.textColor;

    if (needsItwUpgrade) {
      return {
        titleColor: baseColor,
        titleOpacity: 0.5,
        colorScheme: "faded"
      };
    }

    if (status === "unknown") {
      return {
        titleColor: Color(baseColor).grayscale().hex(),
        titleOpacity: 0.5,
        colorScheme: "greyscale"
      };
    }

    if (isValid) {
      return {
        titleColor: baseColor,
        titleOpacity: 1,
        colorScheme: "default"
      };
    }

    return {
      titleColor: baseColor,
      titleOpacity: 0.5,
      colorScheme: "faded"
    };
  }, [theme, status, needsItwUpgrade]);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <LegacyCardBackground
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
              {credentialName.toUpperCase()}
            </IOText>
            {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
          </HStack>
        </View>
        <DigitalVersionBadge
          credentialType={credentialType}
          colorScheme={colorScheme}
        />
        <View
          style={[
            styles.border,
            {
              borderColor: borderColorMap[status]
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    aspectRatio: 16 / 10,
    borderRadius: 8
  },
  cardContainer: {
    flex: 1,
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
    borderWidth: 1,
    zIndex: 11
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12
  },
  statusTag: {
    position: "absolute",
    right: 16,
    top: 10,
    zIndex: 20
  },
  statusOverlay: {
    opacity: 0.7
  }
});
