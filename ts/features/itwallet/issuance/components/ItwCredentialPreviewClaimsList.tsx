import { Divider, H6, IOStyles } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { ItwCredentialClaim } from "../../common/components/ItwCredentialClaim";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import { parseClaims, WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwCredentialClaimsListProps = {
  data: StoredCredential;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
const ItwCredentialPreviewClaimsList = ({
  data
}: ItwCredentialClaimsListProps) => {
  const claims = parseClaims(data.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.link_qr_code]
  });

  return (
    <>
      <View style={IOStyles.rowSpaceBetween}>
        <H6 color="grey-700">
          {I18n.t(
            "features.itWallet.presentation.credentialDetails.documentDataTitle"
          )}
        </H6>
      </View>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim claim={elem} isPreview={true} hidden={false} />
          <Divider />
        </View>
      ))}
      <ItwReleaserName credential={data} isPreview={true} />
    </>
  );
};

const MemoizedItwCredentialPreviewClaimsList = React.memo(
  ItwCredentialPreviewClaimsList
);

export { MemoizedItwCredentialPreviewClaimsList as ItwCredentialPreviewClaimsList };
