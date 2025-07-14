import { memo } from "react";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwShouldRenderWalletUpgradeMDLDetailsBannerSelector } from "../../../common/store/selectors";
import { useIOSelector } from "../../../../../store/hooks";
import { ItwPresentationFiscalCode } from "./ItwPresentationFiscalCode.tsx";
import { ItwPresentationWalletUpgradeMDLDetailsBanner } from "./ItwPresentationWalletUpgradeMDLDetailsBanner";

type Props = {
  credential: StoredCredential;
};

/**
 * This component returns the additional information required by a credential details screen, which is not
 * part of the credential claims
 */
const ItwPresentationAdditionalInfoSection = ({ credential }: Props) => {
  const shouldRenderWalletUpgradeMdlBanner = useIOSelector(state =>
    itwShouldRenderWalletUpgradeMDLDetailsBannerSelector(state, credential)
  );
  switch (credential.credentialType) {
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
