import { memo, useCallback } from "react";
import { View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Alert, IOButton, IOToast, VStack } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils.ts";
import {
  ClaimsLocales,
  getClaimsFullLocale,
  getCredentialExpireDays
} from "../../../common/utils/itwClaimsUtils.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import {
  itwCredentialStatusSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { format } from "../../../../../utils/dates.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useItwRemoveCredentialWithConfirm } from "../hooks/useItwRemoveCredentialWithConfirm";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackItwCredentialTapBanner,
  trackItwCredentialBottomSheet,
  trackItwCredentialBottomSheetAction
} from "../analytics";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/analyticsTypes";
import { getMixPanelCredential } from "../../../analytics/utils/analyticsUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { ItwEidLifecycleAlert } from "../../../common/components/ItwEidLifecycleAlert";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

type Props = {
  credential: StoredCredential;
};

const excludedCredentialTypes = [
  CredentialType.PID,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY
] as const;

type ExcludedCredentialTypes = (typeof excludedCredentialTypes)[number];

const LICENSE_RENEWAL_URL = "https://www.mit.gov.it/rinnovo-patente";

type CredentialAlertEvents = "tap_banner" | "open_bottom_sheet" | "press_cta";

export type TrackCredentialAlert = (action: CredentialAlertEvents) => void;

type CredentialStatusAlertProps = {
  credential: StoredCredential;
  onTrack: TrackCredentialAlert;
  status?: ItwCredentialStatus;
};

export enum CredentialAlertType {
  EID_LIFECYCLE = "EID_LIFECYCLE",
  JWT_VERIFICATION = "JWT_VERIFICATION",
  DOCUMENT_EXPIRING = "DOCUMENT_EXPIRING",
  ISSUER_DYNAMIC_ERROR = "ISSUER_DYNAMIC_ERROR",
  DOCUMENT_EXPIRED = "DOCUMENT_EXPIRED"
}

type CredentialAlertProps = {
  eidStatus: ItwJwtCredentialStatus | undefined;
  credentialStatus: ItwCredentialStatus | undefined;
  message: Record<string, { title: string; description: string }> | undefined;
  isOffline: boolean;
  isItwL3: boolean;
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
): CredentialAlertType | undefined => {
  const { eidStatus, credentialStatus, message, isOffline, isItwL3 } = props;

  const isEidExpired = eidStatus === "jwtExpired";
  const isEidExpiring = eidStatus === "jwtExpiring";
  const isCredentialJwtExpiring = credentialStatus === "jwtExpiring";
  const isCredentialJwtExpired = credentialStatus === "jwtExpired";

  const isEidInvalid = isEidExpired || isEidExpiring;
  const isCredentialJwtInvalid =
    isCredentialJwtExpiring || isCredentialJwtExpired;

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
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const { status, message } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const { name: currentScreenName } = useRoute();

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
      case "tap_banner":
        trackItwCredentialTapBanner(trackingData);
        break;
      case "open_bottom_sheet":
        trackItwCredentialBottomSheet(trackingData);
        break;
      case "press_cta":
        trackItwCredentialBottomSheetAction(trackingData);
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
    case CredentialAlertType.EID_LIFECYCLE:
      return (
        <ItwEidLifecycleAlert
          navigation={navigation}
          currentScreenName={currentScreenName}
        />
      );
    case CredentialAlertType.JWT_VERIFICATION:
      return (
        <JwtVerificationAlert
          credential={credential}
          onTrack={trackCredentialAlertEvent}
          status={status}
        />
      );
    case CredentialAlertType.DOCUMENT_EXPIRING:
      return (
        <DocumentExpiringAlert
          credential={credential}
          onTrack={trackCredentialAlertEvent}
        />
      );
    case CredentialAlertType.ISSUER_DYNAMIC_ERROR:
      return (
        <IssuerDynamicErrorAlert
          message={message!}
          credential={credential}
          onTrack={trackCredentialAlertEvent}
        />
      );
    case CredentialAlertType.DOCUMENT_EXPIRED:
      return (
        <Alert
          testID="itwExpiredBannerTestID"
          variant="error"
          content={I18n.t(
            "features.itWallet.presentation.alerts.expired.content"
          )}
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
      testID="itwExpiringBannerTestID"
      variant={isExpired ? "error" : "warning"}
      content={I18n.t(
        `features.itWallet.presentation.alerts.jwtVerification.content.${
          isExpired ? "jwtExpired" : "jwtExpiring"
        }`,
        { date: format(credential.jwt.expiration, "DD-MM-YYYY") }
      )}
      action={I18n.t(
        "features.itWallet.presentation.alerts.jwtVerification.action"
      )}
      onPress={beginCredentialIssuance}
    />
  );
};

const DocumentExpiringAlert = ({
  credential,
  onTrack
}: CredentialStatusAlertProps) => {
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const showCta = credential.credentialType === CredentialType.DRIVING_LICENSE;

  const bottomSheetNs = `features.itWallet.presentation.bottomSheets.${
    credential.credentialType as Exclude<
      CredentialType,
      ExcludedCredentialTypes
    >
  }.expiring` as const;

  const handleCtaPress = useCallback(() => {
    onTrack("press_cta");
    openWebUrl(LICENSE_RENEWAL_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );
  }, [onTrack]);

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(`${bottomSheetNs}.title`),
    component: (
      <VStack space={24}>
        <IOMarkdown content={I18n.t(`${bottomSheetNs}.content`)} />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              variant="outline"
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.bottomSheets.mDL.expiring.cta"
              )}
              onPress={handleCtaPress}
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
        testID="itwExpiringBannerTestID"
        variant="warning"
        content={I18n.t(
          "features.itWallet.presentation.alerts.expiring.content",
          { days: expireDays }
        )}
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        onPress={handleAlertPress}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  message: Record<string, { title: string; description: string }>;
  credential: StoredCredential;
  onTrack: TrackCredentialAlert;
};

const IssuerDynamicErrorAlert = ({
  message,
  credential,
  onTrack
}: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = getLocalizedMessageOrFallback(message);
  const showCta = credential.credentialType === CredentialType.DRIVING_LICENSE;

  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);

  const bottomSheet = useIOBottomSheetModal({
    title: localizedMessage.title,
    component: (
      <VStack space={24}>
        <IOMarkdown content={localizedMessage.description} />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t(
                "features.itWallet.presentation.alerts.mdl.invalid.cta"
              )}
              onPress={confirmAndRemoveCredential}
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
        variant="error"
        content={localizedMessage.title}
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        onPress={handleAlertPress}
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
