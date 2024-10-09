import { Divider } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import { ItwCredentialClaim } from "../../common/components/ItwCredentialClaim";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import { parseClaims, WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwCredentialClaimsListProps = {
  data: StoredCredential;
  releaserVisible?: boolean;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
const ItwCredentialPreviewClaimsList = ({
  data,
  releaserVisible = true
}: ItwCredentialClaimsListProps) => {
  const claims = parseClaims(data.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.link_qr_code]
  });

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim claim={elem} isPreview={true} hidden={false} />
          {index < claims.length - 1 && <Divider />}
        </View>
      ))}
      {releaserVisible && (
        <>
          <Divider />
          <ItwReleaserName credential={data} isPreview={true} />
        </>
      )}
    </>
  );
};

const MemoizedItwCredentialPreviewClaimsList = React.memo(
  ItwCredentialPreviewClaimsList
);

export { MemoizedItwCredentialPreviewClaimsList as ItwCredentialPreviewClaimsList };
