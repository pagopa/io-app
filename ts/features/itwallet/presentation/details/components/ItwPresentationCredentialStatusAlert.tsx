import { memo } from "react";
import { Alert, Body } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import {
  getClaimsFullLocale,
  getCredentialExpireDays
} from "../../../common/utils/itwClaimsUtils.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { format } from "../../../../../utils/dates.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider.tsx";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { type CredentialType } from "../../../common/utils/itwMocksUtils.ts";

type Props = {
  credential: StoredCredential;
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

  if (status === "jwtExpiring") {
    return <VerificationExpiringAlert credential={credential} />;
  }

  if (status === "expiring") {
    return <DocumentExpiringAlert credential={credential} />;
  }

  if (message) {
    return <IssuerDynamicErrorAlert message={message} />;
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

const VerificationExpiringAlert = ({ credential }: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const beginCredentialIssuance = () => {
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

const DocumentExpiringAlert = ({ credential }: Props) => {
  const expireDays = getCredentialExpireDays(credential.parsedCredential);

  const bottomSheetNs = `features.itWallet.presentation.bottomSheets.${
    credential.credentialType as Exclude<CredentialType, CredentialType.PID>
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
        onPress={() => bottomSheet.present()}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  message: Record<string, { title: string; description: string }>;
};

const IssuerDynamicErrorAlert = ({ message }: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = message[getClaimsFullLocale()];
  const bottomSheet = useIOBottomSheetModal({
    title: localizedMessage.title,
    component: <Body>{localizedMessage.description}</Body>
  });

  return (
    <>
      <Alert
        variant="error"
        content={localizedMessage.title}
        action={I18n.t("features.itWallet.presentation.alerts.statusAction")}
        onPress={bottomSheet.present}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

const Memoized = memo(ItwPresentationCredentialStatusAlert);

export { Memoized as ItwPresentationCredentialStatusAlert };
