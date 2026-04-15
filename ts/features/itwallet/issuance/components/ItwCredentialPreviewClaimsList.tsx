import { Divider } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import { ItwCredentialClaim } from "../../common/components/ItwCredentialClaim";
import { ItwIssuanceMetadata } from "../../common/components/ItwIssuanceMetadata";
import { parseClaims, WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";

type ItwCredentialClaimsListProps = {
  data: CredentialMetadata;
  releaserVisible?: boolean;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link CredentialMetadata} of the credential.
 * @param releaserVisible - if true, the releaser metadata is shown at the end of the list (default: true).
 */
const ItwCredentialPreviewClaimsList = ({
  data,
  releaserVisible = true
}: ItwCredentialClaimsListProps) => {
  const claims = parseClaims(data.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.link_qr_code]
  });
  const { credentialType } = data;

  return (
    <View>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim
            claim={elem}
            isPreview={true}
            hidden={false}
            credentialType={credentialType}
          />
          {index < claims.length - 1 && <Divider />}
        </View>
      ))}
      {releaserVisible && (
        <>
          <Divider />
          <ItwIssuanceMetadata credential={data} isPreview={true} />
        </>
      )}
    </View>
  );
};

const MemoizedItwCredentialPreviewClaimsList = memo(
  ItwCredentialPreviewClaimsList
);

export { MemoizedItwCredentialPreviewClaimsList as ItwCredentialPreviewClaimsList };
