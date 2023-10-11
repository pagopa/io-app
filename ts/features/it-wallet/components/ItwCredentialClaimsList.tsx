import React from "react";
import {
  Divider,
  IconButton,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { CredentialCatalogItem } from "../utils/mocks";
import I18n from "../../../i18n";

/**
 * This type is used to extract the claims from the credential mock type.
 */
type ClaimsType = Partial<keyof CredentialCatalogItem["claims"]>;

/**
 * This type represents the props of the ClaimsList component.
 */
type ClaimsListProps = {
  credential: CredentialCatalogItem;
  claims: Array<ClaimsType>;
  onInfoPress?: () => void;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param credential - contains the credential.
 * @param claims - contains the claim to be displayed.
 * @param onLinkPress - function to be called for the issuer info action. To be passed only if claims contains the issuedByNew claim.
 */
const ItwCredentialClaimsList = ({
  credential,
  claims,
  onInfoPress
}: ClaimsListProps) => {
  const RenderClaim = ({ claim }: { claim: ClaimsType }) => {
    const value = credential.claims[claim];
    const label = I18n.t(
      `features.itWallet.verifiableCredentials.claims.${claim}`
    );

    const hasInfo = (claim: ClaimsType) => claim === "issuedByNew";

    return (
      <ListItemInfo
        label={label}
        value={value}
        accessibilityLabel={`${label} ${value}`}
        action={
          hasInfo(claim) &&
          onInfoPress && (
            <IconButton
              icon="info"
              onPress={onInfoPress}
              accessibilityLabel={"info"}
            />
          )
        }
      />
    );
  };

  return (
    <>
      {claims.map((claim, index) => (
        <View key={`${index}_${claim}`}>
          <RenderClaim claim={claim} key={`${index}_${claim}`} />
          <Divider />
        </View>
      ))}
    </>
  );
};

export default ItwCredentialClaimsList;
