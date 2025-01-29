import { memo } from "react";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwPresentationFiscalCode } from "./ItwPresentationFiscalCode";

type Props = {
  credential: StoredCredential;
};

/**
 * This component returns the additional information required by a credential details screen, which is not
 * part of the credential claims
 */
const ItwPresentationAdditionalInfoSection = ({ credential }: Props) => {
  switch (credential.credentialType) {
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return <ItwPresentationFiscalCode />;
    default:
      return null;
  }
};

const MemoizedItwPresentationAdditionalInfoSection = memo(
  ItwPresentationAdditionalInfoSection
);

export { MemoizedItwPresentationAdditionalInfoSection as ItwPresentationAdditionalInfoSection };
