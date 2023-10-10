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
 * This type is used to extract the claims from the PID type and exclude the placeOfBirth claim since we don't use it.
 */
type ClaimsType = Partial<keyof CredentialCatalogItem["claims"]>;

/**
 * This type represents the props of the common ClaimsList component without the securityLevel prop.
 */
type ClaimsListProps = {
  credential: CredentialCatalogItem;
  claims: Array<ClaimsType>;
  onInfoPress?: () => void;
};

/**
 * This component renders the list of claims for a PID credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * It also renders the expiry date, the issuer info and the security level if the props are passed.
 * When the securityLevel prop is passed, the onLinkPress prop is required.
 * @param claims - contains the claim to be displayed.
 * @param decodedPid - contains the decoded PID.
 * @param expiryDate - if true, renders the expiry date.
 * @param issuerInfo - if true, renders the issuer info.
 * @param securityLevel - if true, renders the security level.
 * @param onLinkPress - function to be called when the security level link is pressed, required only if securityLevel is true.
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
