import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { NewCredential } from "../../../common/utils/itwCredentialUtils";

type Props = {
  credentialType: NewCredential;
};

const i18nNs =
  "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content";

/**
 * Alert showing information about the validity of new IT Wallet credentials.
 */
export const ItwPresentationNewCredentialValidityAlert = ({
  credentialType
}: Props) => {
  const content = I18n.t(`${i18nNs}.${credentialType}`);

  return (
    <Alert testID="newCredentialAlertTestID" variant="info" content={content} />
  );
};
