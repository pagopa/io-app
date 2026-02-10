import { memo } from "react";
import { useIOSelector } from "../../../../../store/hooks";
import { itwShouldRenderWalletUpgradeMDLDetailsBannerSelector } from "../../../common/store/selectors";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { ItwPresentationFiscalCode } from "./ItwPresentationFiscalCode.tsx";
import { ItwPresentationNewCredentialValidityAlert } from "./ItwPresentationNewCredentialValidityAlert";
import { ItwPresentationWalletUpgradeMDLDetailsBanner } from "./ItwPresentationWalletUpgradeMDLDetailsBanner";

type Props = {
  credential: CredentialMetadata;
};

/**
 * This component returns the additional information required by a credential details screen, which is not
 * part of the credential claims
 */
const ItwPresentationAdditionalInfoSection = ({ credential }: Props) => {
  const shouldRenderWalletUpgradeMdlBanner = useIOSelector(
    itwShouldRenderWalletUpgradeMDLDetailsBannerSelector
  );

  switch (credential.credentialType) {
    case CredentialType.EDUCATION_DEGREE:
    case CredentialType.EDUCATION_ENROLLMENT:
    case CredentialType.RESIDENCY:
      return (
        <ItwPresentationNewCredentialValidityAlert
          credentialType={credential.credentialType}
        />
      );
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return <ItwPresentationFiscalCode />;
    case CredentialType.DRIVING_LICENSE:
      return (
        shouldRenderWalletUpgradeMdlBanner && (
          <ItwPresentationWalletUpgradeMDLDetailsBanner />
        )
      );
    default:
      return null;
  }
};

const MemoizedItwPresentationAdditionalInfoSection = memo(
  ItwPresentationAdditionalInfoSection
);

export { MemoizedItwPresentationAdditionalInfoSection as ItwPresentationAdditionalInfoSection };
