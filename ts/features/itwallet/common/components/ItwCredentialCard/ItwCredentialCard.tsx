import {
  HStack,
  Icon,
  IOColors,
  IOText,
  Tag,
  useIOTheme
} from "@pagopa/io-app-design-system";
import Color from "color";
import I18n from "i18next";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { useItwDisplayCredentialStatus } from "../../../presentation/details/hooks/useItwDisplayCredentialStatus";
import {
  getCredentialNameFromType,
  useTagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { useThemeColorByCredentialType } from "../../utils/itwStyleUtils";
import { itwShouldUpgradeCredentialSelector } from "../../store/selectors";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItWalletIdLogo } from "../ItWalletIdLogo";
import { CardBackground } from "./CardBackground";
import { getCredentialCardConfig } from "./credentialCardConfig";
import { DigitalVersionBadge } from "./DigitalVersionBadge";
import { CardColorScheme } from "./types";

export type ItwCredentialCard = {
  /**
   * Type of the credential, which is used to determine the
   * visual representation and styling of the card.
   */
  credentialType: string;
  /**
   * Current status of the credential, used to determine the
   * visual representation and the status tag to display.
   */
  credentialStatus?: ItwCredentialStatus;
  /**
   * Issue date of the credential.
   * Used to determine whether the card should display
   * the "upgrade pending" badge when the user owns
   * an L3 PID and the credential was issued before it.
   */
  issuedAt?: string;
  /**
   * Indicates if the credential is a multi-level credential,
   * which affects the display of a specific badge on the card.
   */
  isMultiCredential?: boolean;
};

type StyleProps = {
  titleColor: string;
  titleOpacity: number;
  colorScheme: CardColorScheme;
};

export const ItwCredentialCard = ({
  credentialType,
  credentialStatus = "valid",
  issuedAt,
  isMultiCredential
}: ItwCredentialCard) => {
  const typefacePreference = useIOSelector(fontPreferenceSelector);
  const needsItwUpgrade = useIOSelector(
    itwShouldUpgradeCredentialSelector(credentialType, issuedAt)
  );
  const ioTheme = useIOTheme();
  const status = useItwDisplayCredentialStatus(credentialStatus);
  const theme = useThemeColorByCredentialType(credentialType);
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const borderColorMap = useBorderColorByStatus();
  const tagPropsByStatus = useTagPropsByStatus();
  const cardConfig = getCredentialCardConfig(credentialType);

  const statusTagProps: Tag | undefined = needsItwUpgrade
    ? {
        variant: "info",
        text: I18n.t("features.itWallet.card.status.upgradePending")
      }
    : tagPropsByStatus[status];

  const { titleColor, titleOpacity, colorScheme } = useMemo<StyleProps>(() => {
    // Include "jwtExpired" as a valid status because credentials with this state
    // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
    const isValid = [...validCredentialStatuses, "jwtExpired"].includes(status);
    const baseColor = withL3Design ? cardConfig.titleColor : theme.textColor;

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
  }, [withL3Design, theme, cardConfig, status, needsItwUpgrade]);

  const hasCredentialBorderColor = withL3Design && status === "valid";

  const appBackgroundColor = IOColors[ioTheme["appBackground-primary"]];

  return (
    <View
      style={[
        styles.cardWrapper,
        hasCredentialBorderColor && {
          boxShadow: `0 0 0 2px ${appBackgroundColor}`
        }
      ]}
    >
      <View style={styles.cardContainer}>
        <CardBackground
          credentialType={credentialType}
          colorScheme={colorScheme}
        />
        <View style={styles.header}>
          <HStack space={16}>
            {credentialType === CredentialType.PID && withL3Design ? (
              <View style={{ flex: 1 }}>
                <ItWalletIdLogo width={117} height={27} />
              </View>
            ) : (
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
            )}
            {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
            {isMultiCredential && (
              <Icon name="multiCard" color="grey-850" size={24} />
            )}
          </HStack>
        </View>
        {!withL3Design && (
          <DigitalVersionBadge
            credentialType={credentialType}
            colorScheme={colorScheme}
          />
        )}
        <View
          style={[
            styles.border,
            {
              borderColor:
                withL3Design && status === "valid"
                  ? cardConfig.borderColor
                  : borderColorMap[status]
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
    paddingTop: 14
  }
});
