import { Alert } from "@io-app/design-system";
import I18n from "i18next";

import { NewCredential } from "../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

type Props = {
  credentialType: ValidityAlertCredential;
};

/**
 * Proof_of_age is a new credential but shows its own usage banner instead of
 * this generic validity alert, so it is excluded here (no validity message
 * exists for it).
 */
type ValidityAlertCredential = Exclude<
  NewCredential,
  CredentialType.PROOF_OF_AGE
>;

// Validity alert content locale key per credential type. Kept as explicit
// literals (instead of a dynamically composed key) so they remain statically
// analysable; `satisfies` enforces one entry per credential type.
const validityAlertContentKeys = {
  [CredentialType.EDUCATION_DEGREE]:
    "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_degree",
  [CredentialType.EDUCATION_ENROLLMENT]:
    "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_enrollment",
  [CredentialType.RESIDENCY]:
    "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.residency",
  [CredentialType.EDUCATION_DIPLOMA]:
    "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_diploma",
  [CredentialType.EDUCATION_ATTENDANCE]:
    "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_attendance"
} as const satisfies Record<ValidityAlertCredential, string>;

/** Alert showing information about the validity of new IT Wallet credentials. */
export const ItwPresentationNewCredentialValidityAlert = ({
  credentialType
}: Props) => {
  const content = I18n.t(validityAlertContentKeys[credentialType]);

  return (
    <Alert content={content} testID="newCredentialAlertTestID" variant="info" />
  );
};
