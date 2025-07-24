import { memo } from "react";
import { Alert } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../../i18n.ts";
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
import {
  CREDENTIALS_MAP,
  CREDENTIAL_STATUS_MAP,
  trackItwCredentialBottomSheet,
  trackItwCredentialTapBanner
} from "../../../analytics";

type Props = {
  credential: StoredCredential;
};

const excludedCredentialTypes = [
  CredentialType.PID,
  CredentialType.DEGREE_CERTIFICATES
] as const;

type ExcludedCredentialTypes = (typeof excludedCredentialTypes)[number];

type CredentialAlertEvents = "banner_tap" | "bottom_sheet_open";

export type TrackCredentialAlert = (action: CredentialAlertEvents) => void;

type CredentialStatusAlertProps = {
  credential: StoredCredential;
  onTrack: TrackCredentialAlert;
};

const handleAlertPress =
  (onTrack: TrackCredentialAlert, bottomSheet: { present: () => void }) =>
  () => {
    onTrack("banner_tap");
    bottomSheet.present();
    onTrack("bottom_sheet_open");
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

  const trackCredentialAlertEvent = (action: CredentialAlertEvents) => {
    if (!status) {
      return;
    }

    const data = {
      credential: CREDENTIALS_MAP[credential.credentialType],
      credential_status: CREDENTIAL_STATUS_MAP[status]
    };

    if (action === "banner_tap") {
      trackItwCredentialTapBanner(data);
    }

    if (action === "bottom_sheet_open") {
      trackItwCredentialBottomSheet(data);
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
    onTrack("banner_tap");
    machineRef.send({
      type: "select-credential",
      credentialType: credential.credentialType
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

  const bottomSheetNs = `features.itWallet.presentation.bottomSheets.${
    credential.credentialType as Exclude<
      CredentialType,
      ExcludedCredentialTypes
    >
  }.expiring` as const;

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(`${bottomSheetNs}.title`),
    component: <IOMarkdown content={I18n.t(`${bottomSheetNs}.content`)} />
  });

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
        onPress={handleAlertPress(onTrack, bottomSheet)}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  message: Record<string, { title: string; description: string }>;
  onTrack: TrackCredentialAlert;
};

const IssuerDynamicErrorAlert = ({
  message,
  onTrack
}: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = getLocalizedMessageOrFallback(message);

  const bottomSheet = useIOBottomSheetModal({
    title: localizedMessage.title,
    component: <IOMarkdown content={localizedMessage.description} />
  });

  return (
    <>
      <Alert
        variant="error"
        content={localizedMessage.title}
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        onPress={handleAlertPress(onTrack, bottomSheet)}
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
