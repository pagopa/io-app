import { Alert } from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";

import { NewCredential } from "../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

type Props = {
  credentialType: ValidityAlertCredential;
};

/**
 * proof_of_age is a new credential but shows its own usage banner instead of this generic
 * validity alert, so it is excluded here (no validity message exists for it).
 */
type ValidityAlertCredential = Exclude<
  NewCredential,
  CredentialType.PROOF_OF_AGE
>;

/**
 * Alert showing information about the validity of new IT Wallet credentials.
 */
export const ItwPresentationNewCredentialValidityAlert = ({
  credentialType
}: Props) => {
  const content = useMemo(() => {
    switch (credentialType) {
      case CredentialType.EDUCATION_ATTENDANCE:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_attendance"
        );
      case CredentialType.EDUCATION_DEGREE:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_degree"
        );
      case CredentialType.EDUCATION_DIPLOMA:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_diploma"
        );
      case CredentialType.EDUCATION_ENROLLMENT:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_enrollment"
        );
      case CredentialType.RESIDENCY:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.residency"
        );
    }
  }, [credentialType]);

  return (
    <Alert content={content} testID="newCredentialAlertTestID" variant="info" />
  );
};
