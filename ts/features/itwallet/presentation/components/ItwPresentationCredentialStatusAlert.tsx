import React, { memo } from "react";
import { Alert, Body } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  getClaimsFullLocale,
  getCredentialExpireDays
} from "../../common/utils/itwClaimsUtils";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { useIOSelector } from "../../../../store/hooks";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";
import { format } from "../../../../utils/dates";

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders an alert with the invalid status message
 * extracted from the entity configuration. The content of this alert
 * is dynamic and not defined in `io-app`.
 */
const ItwPresentationCredentialInvalidStatusAlert = ({ credential }: Props) => {
  const { status, message } = useIOSelector(
    itwCredentialStatusSelector(credential.credentialType)
  );

  // #region Digital credential
  if (status === "verificationExpiring") {
    return (
      <Alert
        testID="itwExpiringBannerTestID"
        variant="warning"
        content={I18n.t(
          "features.itWallet.presentation.alerts.verificationExpiring.content",
          { date: format(credential.jwt.expiration, "DD-MM-YYYY") }
        )}
      />
    );
  }

  if (status === "verificationExpired") {
    return null;
  }
  // #endregion Digital credential

  // #region Physical document
  if (status === "expiring") {
    const expireDays = getCredentialExpireDays(credential.parsedCredential);
    return (
      <Alert
        testID="itwExpiringBannerTestID"
        variant="warning"
        content={I18n.t(
          "features.itWallet.presentation.alerts.expiring.content",
          { days: expireDays }
        )}
      />
    );
  }

  if (message) {
    return <LocalizedErrorAlert message={message} />;
  }
  // #endregion Physical document

  return null;
};

type LocalizedErrorAlertProps = {
  message: Record<string, { title: string; description: string }>;
};

const LocalizedErrorAlert = ({ message }: LocalizedErrorAlertProps) => {
  const localizedMessage = message[getClaimsFullLocale()];
  const bottomSheet = useIOBottomSheetAutoresizableModal(
    {
      title: localizedMessage.title,
      component: <Body>{localizedMessage.description}</Body>
    },
    128
  );

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

const Memoized = memo(ItwPresentationCredentialInvalidStatusAlert);

export { Memoized as ItwPresentationCredentialInvalidStatusAlert };
