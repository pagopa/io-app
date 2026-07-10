import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { NewCredential } from "../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

/**
 * proof_of_age is a new credential but shows its own usage banner instead of this generic
 * validity alert, so it is excluded here (no validity message exists for it).
 */
type ValidityAlertCredential = Exclude<
  NewCredential,
  CredentialType.PROOF_OF_AGE
>;

type Props = {
  credentialType: ValidityAlertCredential;
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
