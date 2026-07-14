import { Alert, IOButton, IOToast, VStack } from "@io-app/design-system";
import { useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { memo, useCallback } from "react";
import { View } from "react-native";

import IOMarkdown from "../../../../../components/IOMarkdown";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { format } from "../../../../../utils/dates.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { openWebUrl } from "../../../../../utils/url";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/types.ts";
import { ItwEidLifecycleAlert } from "../../../common/components/ItwEidLifecycleAlert";
import {
  ClaimsLocales,
  getClaimsFullLocale,
  getCredentialExpireDays
} from "../../../common/utils/itwClaimsUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  CredentialMetadata,
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialStatusSelector
} from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import {
  trackItwCredentialBottomSheet,
  trackItwCredentialBottomSheetAction,
  trackItwCredentialTapBanner
} from "../analytics";
import { useItwIssuerDynamicErrorBottomSheet } from "../hooks/useItwIssuerDynamicErrorBottomSheet";

type Props = {
  credential: CredentialMetadata;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used as type
const excludedCredentialTypes = [
  CredentialType.PID,
  CredentialType.PROOF_OF_AGE,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY,
  CredentialType.EDUCATION_DIPLOMA,
  CredentialType.EDUCATION_ATTENDANCE
] as const;

type ExcludedCredentialTypes = (typeof excludedCredentialTypes)[number];

// Expiring bottom sheet locale keys per credential type. Kept as explicit
// literals (instead of a dynamically composed key) so they remain statically
// analysable and discoverable. `satisfies` enforces one entry per non-excluded
// credential type.
const expiringBottomSheetKeys = {
  [CredentialType.DRIVING_LICENSE]: {
    title: "features.itWallet.presentation.bottomSheets.mDL.expiring.title",
    content: "features.itWallet.presentation.bottomSheets.mDL.expiring.content"
  },
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
    title:
      "features.itWallet.presentation.bottomSheets.EuropeanHealthInsuranceCard.expiring.title",
    content:
      "features.itWallet.presentation.bottomSheets.EuropeanHealthInsuranceCard.expiring.content"
  },
  [CredentialType.EUROPEAN_DISABILITY_CARD]: {
    title:
      "features.itWallet.presentation.bottomSheets.EuropeanDisabilityCard.expiring.title",
    content:
      "features.itWallet.presentation.bottomSheets.EuropeanDisabilityCard.expiring.content"
  }
} as const satisfies Record<
  Exclude<CredentialType, ExcludedCredentialTypes>,
  { content: string; title: string }
>;

const LICENSE_RENEWAL_URL = "https://www.mit.gov.it/rinnovo-patente";

export enum CredentialAlertType {
  DOCUMENT_EXPIRED = "DOCUMENT_EXPIRED",
  DOCUMENT_EXPIRING = "DOCUMENT_EXPIRING",
  EID_LIFECYCLE = "EID_LIFECYCLE",
  INVALID_CREDENTIAL = "INVALID_CREDENTIAL",
  ISSUER_DYNAMIC_ERROR = "ISSUER_DYNAMIC_ERROR",
  JWT_VERIFICATION = "JWT_VERIFICATION"
}

export type TrackCredentialAlert = (action: CredentialAlertEvents) => void;

type CredentialAlertEvents = "open_bottom_sheet" | "press_cta" | "tap_banner";

type CredentialAlertProps = {
  credentialStatus: ItwCredentialStatus | undefined;
  eidStatus: ItwJwtCredentialStatus | undefined;
  isItwL3: boolean;
  isOffline: boolean;
  message: Record<string, { description: string; title: string }> | undefined;
};

type CredentialStatusAlertProps = {
  credential: CredentialMetadata;
  onTrack: TrackCredentialAlert;
  status?: ItwCredentialStatus;
};

const useAlertPressHandler =
  (onTrack: TrackCredentialAlert, bottomSheet: { present: () => void }) =>
  () => {
    onTrack("tap_banner");
    bottomSheet.present();
    onTrack("open_bottom_sheet");
  };

// Helper function that calculates which alert type should be shown.
export const deriveCredentialAlertType = (
  props: CredentialAlertProps
): CredentialAlertType | undefined => {
  const { eidStatus, credentialStatus, message, isOffline, isItwL3 } = props;

  const isEidExpired = eidStatus === "jwtExpired";
  const isEidExpiring = eidStatus === "jwtExpiring";
  const isCredentialJwtExpiring = credentialStatus === "jwtExpiring";
  const isCredentialJwtExpired = credentialStatus === "jwtExpired";

  const isEidInvalid = isEidExpired || isEidExpiring;
  const isCredentialJwtInvalid =
    isCredentialJwtExpiring || isCredentialJwtExpired;

  // When PID is expired in L3 mode, only show INVALID_CREDENTIAL if the credential
  // is also jwtExpired (both expired case). When only PID is expired, no alert is
  // shown here — the PID itself handles its own alert on its detail screen.
  if (isItwL3 && isEidExpired) {
    if (isCredentialJwtExpired) {
      return CredentialAlertType.INVALID_CREDENTIAL;
    }
    return undefined;
  }

  // Handle alerts only if the credential JWT is expiring or expired
  if (isCredentialJwtInvalid) {
    /**
     * 1. Don't show any alert if:
     * - The eID is expired or expiring AND the credential JWT is expiring
     * - OR the app is offline but the credential JWT is not yet expired
     */
    const shouldHideAlert =
      (isEidInvalid && isCredentialJwtExpiring) ||
      (isOffline && !isCredentialJwtExpired);

    if (shouldHideAlert) {
      return undefined;
    }

    /**
     * 2. Show the eID lifecycle alert if:
     * - Both the eID and the credential JWT are expired (and not in L3 mode)
     * - OR the app is offline and the credential JWT is expired
     */
    const shouldShowEidAlert =
      (!isItwL3 && isEidExpired && isCredentialJwtExpired) ||
      (isOffline && isCredentialJwtExpired);

    if (shouldShowEidAlert) {
      return CredentialAlertType.EID_LIFECYCLE;
    }

    // 3. In all other cases where the JWT is invalid but no special condition applies,
    // show the generic JWT verification alert
    return CredentialAlertType.JWT_VERIFICATION;
  }

  // 4. If the credential status is "expiring", show the Document Expiring alert
  if (credentialStatus === "expiring") {
    return CredentialAlertType.DOCUMENT_EXPIRING;
  }

  // 5. If there is a dynamic message provided by the issuer, show the Issuer Dynamic Error alert
  if (message) {
    return CredentialAlertType.ISSUER_DYNAMIC_ERROR;
  }

  // 6. Fallback when the issuer does not provide a message for an expired credential
  if (credentialStatus === "expired") {
    return CredentialAlertType.DOCUMENT_EXPIRED;
  }

  return undefined;
};

/**
 * This component renders an alert related to the credential status (expiring or invalid).
 * It contains messages that are statically defined in the app's locale or
 * dynamically extracted from the issuer configuration.
 */
const ItwPresentationCredentialStatusAlert = ({ credential }: Props) => {
  const navigation = useIONavigation();
  const { name: currentScreenName } = useRoute();
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const { status, message } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

  const trackCredentialAlertEvent = (action: CredentialAlertEvents): void => {
    if (!status) {
      return;
    }
    const mixPanelCredential = getMixPanelCredential(
      credential.credentialType,
      isItwL3
    );

    const trackingData = {
      credential: mixPanelCredential,
      credential_status: CREDENTIAL_STATUS_MAP[status]
    };

    switch (action) {
      case "open_bottom_sheet":
        trackItwCredentialBottomSheet(trackingData);
        break;
      case "press_cta":
        trackItwCredentialBottomSheetAction(trackingData);
        break;
      case "tap_banner":
        trackItwCredentialTapBanner(trackingData);
        break;
    }
  };

  const alertType = deriveCredentialAlertType({
    eidStatus,
    credentialStatus: status,
    message,
    isOffline: offlineAccessReason !== undefined,
    isItwL3
  });

  if (!alertType) {
    return null;
  }

  switch (alertType) {
    case CredentialAlertType.DOCUMENT_EXPIRED:
      return (
        <Alert
          content={I18n.t(
            "features.itWallet.presentation.alerts.expired.content"
          )}
          testID="itwExpiredBannerTestID"
          variant="error"
        />
      );
    case CredentialAlertType.DOCUMENT_EXPIRING:
      // Only render when the credential type has a dedicated expiring bottom
      // sheet, so the static-key lookup inside the alert is always defined.
      return credential.credentialType in expiringBottomSheetKeys ? (
        <DocumentExpiringAlert
          credential={credential}
          onTrack={trackCredentialAlertEvent}
        />
      ) : null;
    case CredentialAlertType.EID_LIFECYCLE:
      return (
        <ItwEidLifecycleAlert
          currentScreenName={currentScreenName}
          navigation={navigation}
        />
      );
    case CredentialAlertType.INVALID_CREDENTIAL:
      return (
        <Alert
          action={I18n.t(
            `features.itWallet.presentation.alerts.jwtVerification.actionInvalid`
          )}
          content={I18n.t(
            "features.itWallet.presentation.alerts.jwtVerification.content.invalid"
          )}
          onPress={() => {
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
              params: {
                eidReissuing: true,
                level: isItwL3 ? "l3" : "l2"
              }
            });
          }}
          testID="itwExpiredBannerTestID"
          variant="error"
        />
      );
    case CredentialAlertType.ISSUER_DYNAMIC_ERROR:
      return message ? (
        <IssuerDynamicErrorAlert
          credential={credential}
          message={message}
          onTrack={trackCredentialAlertEvent}
          status={status}
        />
      ) : null;
    case CredentialAlertType.JWT_VERIFICATION:
      return (
        <JwtVerificationAlert
          credential={credential}
          onTrack={trackCredentialAlertEvent}
          status={status}
        />
      );
  }
};

const JwtVerificationAlert = ({
  credential,
  onTrack,
  status
}: CredentialStatusAlertProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isExpired = status === "jwtExpired";

  const beginCredentialIssuance = () => {
    onTrack("tap_banner");
    machineRef.send({
      type: "select-credential",
      credentialType: credential.credentialType,
      mode: "reissuance"
    });
  };

  return (
    <Alert
      action={I18n.t(
        `features.itWallet.presentation.alerts.jwtVerification.action`
      )}
      content={I18n.t(
        `features.itWallet.presentation.alerts.jwtVerification.content.${
          isExpired ? "jwtExpired" : "jwtExpiring"
        }`,
        { date: format(credential.jwt.expiration, "DD-MM-YYYY") }
      )}
      onPress={beginCredentialIssuance}
      testID="itwExpiringBannerTestID"
      variant={isExpired ? "error" : "warning"}
    />
  );
};

const DocumentExpiringAlert = ({
  credential,
  onTrack
}: CredentialStatusAlertProps) => {
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const showCta = credential.credentialType === CredentialType.DRIVING_LICENSE;

  const bottomSheetKeys =
    expiringBottomSheetKeys[
      credential.credentialType as Exclude<
        CredentialType,
        ExcludedCredentialTypes
      >
    ];

  const handleCtaPress = useCallback(() => {
    onTrack("press_cta");
    openWebUrl(LICENSE_RENEWAL_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );
  }, [onTrack]);

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(bottomSheetKeys.title),
    component: (
      <VStack space={24}>
        <IOMarkdown content={I18n.t(bottomSheetKeys.content)} />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.bottomSheets.mDL.expiring.cta"
              )}
              onPress={handleCtaPress}
              variant="outline"
            />
          </View>
        )}
      </VStack>
    )
  });

  const handleAlertPress = useAlertPressHandler(onTrack, bottomSheet);

  return (
    <>
      <Alert
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        content={I18n.t(
          "features.itWallet.presentation.alerts.expiring.content",
          { days: expireDays }
        )}
        onPress={handleAlertPress}
        testID="itwExpiringBannerTestID"
        variant="warning"
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  credential: CredentialMetadata;
  message: Record<string, { description: string; title: string }>;
  onTrack: TrackCredentialAlert;
  status?: ItwCredentialStatus;
};

const IssuerDynamicErrorAlert = ({
  message,
  credential,
  onTrack,
  status
}: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = getLocalizedMessageOrFallback(message);
  const bottomSheet = useItwIssuerDynamicErrorBottomSheet({
    credential,
    localizedMessage,
    status
  });

  const handleAlertPress = useAlertPressHandler(onTrack, bottomSheet);

  return (
    <>
      <Alert
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        content={localizedMessage.title}
        onPress={handleAlertPress}
        variant="error"
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

const getLocalizedMessageOrFallback = (
  message: IssuerDynamicErrorAlertProps["message"]
) =>
  pipe(
    message[getClaimsFullLocale()],
    O.fromNullable,
    O.alt(() => O.fromNullable(message[ClaimsLocales.it])),
    O.getOrElse(() => ({
      title: I18n.t("features.itWallet.card.status.unknown"),
      description: I18n.t("features.itWallet.card.status.unknown")
    }))
  );

const Memoized = memo(ItwPresentationCredentialStatusAlert);

export { Memoized as ItwPresentationCredentialStatusAlert };
