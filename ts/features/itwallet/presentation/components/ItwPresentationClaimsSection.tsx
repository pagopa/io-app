import {
  Divider,
  H6,
  IconButton,
  IOStyles
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { ItwCredentialClaim } from "../../common/components/ItwCredentialClaim";
import { ItwQrCodeClaimImage } from "../../common/components/ItwQrCodeClaimImage";
import { ItwIssuanceMetadata } from "../../common/components/ItwIssuanceMetadata";
import {
  getCredentialStatus,
  parseClaims,
  WellKnownClaim
} from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredential;
};

export const ItwPresentationClaimsSection = ({
  credential
}: ItwPresentationClaimsSectionProps) => {
  const [valuesHidden, setValuesHidden] = React.useState(false);
  const credentialStatus = getCredentialStatus(credential);

  const claims = parseClaims(credential.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
  });

  const renderHideValuesToggle = () => (
    <IconButton
      testID="toggle-claim-visibility"
      icon={valuesHidden ? "eyeHide" : "eyeShow"}
      onPress={() => setValuesHidden(x => !x)}
      accessibilityLabel={I18n.t(
        valuesHidden
          ? "features.itWallet.presentation.credentialDetails.actions.showClaimValues"
          : "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
      )}
    />
  );

  return (
    <View>
      {
        // If do not have claims, we should not render the title and the toggle
        claims.length > 0 && (
          <>
            <View style={IOStyles.rowSpaceBetween}>
              <H6 color="grey-700">
                {I18n.t(
                  "features.itWallet.presentation.credentialDetails.documentDataTitle"
                )}
              </H6>
              {renderHideValuesToggle()}
            </View>
          </>
        )
      }
      {claims.map((claim, index) => {
        if (claim.id === WellKnownClaim.link_qr_code) {
          // Since the `link_qr_code` claim  difficult to distinguish from a generic image claim, we need to manually
          // check for the claim and render it accordingly
          return <ItwQrCodeClaimImage key={index} claim={claim} />;
        }

        return (
          <React.Fragment key={index}>
            {index !== 0 && <Divider />}
            <ItwCredentialClaim
              claim={claim}
              isPreview={false}
              hidden={valuesHidden}
              credentialStatus={credentialStatus}
            />
          </React.Fragment>
        );
      })}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} isPreview={false} />
    </View>
  );
};
