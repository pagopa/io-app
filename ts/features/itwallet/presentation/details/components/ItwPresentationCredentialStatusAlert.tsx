import { memo, useCallback } from "react";
import { View } from "react-native";
import { Alert, IOButton, IOToast, VStack } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import {
  ClaimsLocales,
  getClaimsFullLocale,
  getCredentialExpireDays
} from "../../../common/utils/itwClaimsUtils.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { format } from "../../../../../utils/dates.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useItwRemoveCredentialWithConfirm } from "../hooks/useItwRemoveCredentialWithConfirm";
import { openWebUrl } from "../../../../../utils/url";
import {
  CREDENTIALS_MAP,
  CREDENTIAL_STATUS_MAP,
  trackItwCredentialBottomSheet,
  trackItwCredentialBottomSheetAction,
  trackItwCredentialTapBanner
} from "../../../analytics";

type Props = {
  credential: StoredCredential;
};

const excludedCredentialTypes = [
  CredentialType.PID,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT
] as const;

type ExcludedCredentialTypes = (typeof excludedCredentialTypes)[number];

const LICENSE_RENEWAL_URL = "https://www.mit.gov.it/rinnovo-patente";

type CredentialAlertEvents = "tap_banner" | "open_bottom_sheet" | "press_cta";

export type TrackCredentialAlert = (action: CredentialAlertEvents) => void;

type CredentialStatusAlertProps = {
  credential: StoredCredential;
  onTrack: TrackCredentialAlert;
};

const useAlertPressHandler =
  (onTrack: TrackCredentialAlert, bottomSheet: { present: () => void }) =>
  () => {
    onTrack("tap_banner");
    bottomSheet.present();
    onTrack("open_bottom_sheet");
  };

/**
 * This component renders an alert related to the credential status (expiring or invalid).
 * It contains messages that are statically defined in the app's locale or
 * dynamically extracted from the issuer configuration.
 */
const ItwPresentationCredentialStatusAlert = ({ credential }: Props) => {
  const { status, message } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  const trackCredentialAlertEvent = (action: CredentialAlertEvents): void => {
    if (!status) {
      return;
    }

    const trackingData = {
      credential: CREDENTIALS_MAP[credential.credentialType],
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

  if (status === "jwtExpiring") {
    return (
      <VerificationExpiringAlert
        credential={credential}
        onTrack={trackCredentialAlertEvent}
      />
    );
  }

  if (status === "expiring") {
    return (
      <DocumentExpiringAlert
        credential={credential}
        onTrack={trackCredentialAlertEvent}
      />
    );
  }

  if (message) {
    return (
      <IssuerDynamicErrorAlert
        message={message}
        credential={credential}
        onTrack={trackCredentialAlertEvent}
      />
    );
  }

  // Fallback when the issuer does not provide a message for an expired credential
  if (status === "expired") {
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

  return null;
};

const VerificationExpiringAlert = ({
  credential,
  onTrack
}: CredentialStatusAlertProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

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
      variant="warning"
      content={I18n.t(
        "features.itWallet.presentation.alerts.verificationExpiring.content",
        { date: format(credential.jwt.expiration, "DD-MM-YYYY") }
      )}
      action={I18n.t("features.itWallet.presentation.alerts.expired.action")}
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
