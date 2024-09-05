import React from "react";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { ItwQrCodeClaimImage } from "../../common/components/ItwQrCodeClaimImage";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredential;
};

export const ItwPresentationClaimsSection = ({
  credential
}: ItwPresentationClaimsSectionProps) => {
  // Defines the custom claims slot to be rendered before the dybamic list of claims
  const customClaimsSlot = (
    <ItwQrCodeClaimImage claim={credential.parsedCredential.link_qr_code} />
  );

  return (
    <ItwCredentialClaimsList
      data={credential}
      customClaimsSlot={customClaimsSlot}
    />
  );
};
