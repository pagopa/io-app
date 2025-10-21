import { HStack, Icon, IOText, Tag } from "@pagopa/io-app-design-system";
import Color from "color";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import {
  getCredentialNameFromType,
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { getThemeColorByCredentialType } from "../../utils/itwStyleUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../utils/itwTypesUtils";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { CardBackground } from "./CardBackground";
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
   * Used to determine if the card should be displayed with a
   * badge for the upgrade pending status.
   * If its false but the user has an L3 PID, the card will
   * be displayed with a badge.
   */
  isItwCredential?: boolean;
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

/* If the eID status is "jwtExpired" or "jwtExpiring" and the current credential
 * status is not one of the excluded ones (invalid, expired, or expiring),
 * then we should override the credential status to "valid" to ensure
 * the card is displayed correctly during the eID reactivation process.
 */
const shouldOverrideCredentialStatus = (
  maybeEidStatus: ItwJwtCredentialStatus | undefined,
  credentialStatus: ItwCredentialStatus
): boolean => {
  const eIDStatusesRequiringOverride = ["jwtExpired", "jwtExpiring"];
  const credentialStatusesToExclude = ["expired", "expiring", "invalid"];

  return (
    maybeEidStatus !== undefined &&
    eIDStatusesRequiringOverride.includes(maybeEidStatus) &&
    !credentialStatusesToExclude.includes(credentialStatus)
  );
};

export const ItwCredentialCard = ({
  credentialType,
  credentialStatus = "valid",
  isItwCredential,
  isMultiCredential
}: ItwCredentialCard) => {
  const typefacePreference = useIOSelector(fontPreferenceSelector);
  const isItwPid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const needsItwUpgrade = isItwPid && !isItwCredential;
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const shouldOverride = useMemo(
    () => shouldOverrideCredentialStatus(maybeEidStatus, credentialStatus),
    [maybeEidStatus, credentialStatus]
  );

  const status: ItwCredentialStatus = shouldOverride
    ? "valid"
    : credentialStatus;

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

    if (isValid || status === "jwtExpired") {
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
          {isMultiCredential && (
            <Icon name="multiCard" color="grey-850" size={24} />
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
