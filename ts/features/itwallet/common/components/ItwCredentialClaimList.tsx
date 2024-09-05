import {
  Divider,
  H6,
  IconButton,
  IOStyles
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import {
  getCredentialStatus,
  parseClaims,
  WellKnownClaim
} from "../utils/itwClaimsUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwReleaserName } from "./ItwReleaserName";

type ItwCredentialClaimsListProps = {
  /**
   * The {@link StoredCredential} which claims are going to be rendered.
   */
  data: StoredCredential;
  /**
   * A flag to indicate if the credential is in preview mode.
   * In preview mode some claims are excluded from the list and items does not show the end elements.
   */
  isPreview?: boolean;
  /**
   * A React component to be rendered before the dynamic list of claims.
   * It's useful to render claims with custom rendering logic.
   */
  customClaimsSlot?: React.ReactNode;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 * @param isPreview - a flag to indicate if the credential is in preview mode.
 * @param customClaimsSlot - a React component to be rendered before the dynamic list of claims.
 */
export const ItwCredentialClaimsList = ({
  data,
  isPreview,
  customClaimsSlot
}: ItwCredentialClaimsListProps) => {
  const [valuesHidden, setValuesHidden] = React.useState(false);
  const credentialStatus = getCredentialStatus(data);

  const claims = parseClaims(data.parsedCredential, {
    exclude: [
      WellKnownClaim.unique_id,
      WellKnownClaim.link_qr_code,
      // Some claims needs to be excluded based on the preview flag
      ...(isPreview ? [] : [WellKnownClaim.content])
    ]
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
    <>
      {claims.length > 0 && (
        <>
          <View style={IOStyles.rowSpaceBetween}>
            <H6 color="grey-700">
              {I18n.t(
                "features.itWallet.presentation.credentialDetails.documentDataTitle"
              )}
            </H6>
            {!isPreview && renderHideValuesToggle()}
          </View>
          {customClaimsSlot}
          {claims.map((elem, index) => (
            <View key={index}>
              {index !== 0 && <Divider />}
              <ItwCredentialClaim
                claim={elem}
                isPreview={isPreview}
                hidden={valuesHidden}
                credentialStatus={credentialStatus}
              />
            </View>
          ))}
          <Divider />
        </>
      )}
      <ItwReleaserName credential={data} isPreview={isPreview} />
    </>
  );
};
