import React from "react";
import { View } from "react-native";
import { Divider } from "@pagopa/io-app-design-system";
import { parseClaims } from "../utils/itwClaimsUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwReleaserName } from "./ItwReleaserName";

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
export const ItwCredentialClaimsList = ({
  data,
  isPreview
}: {
  data: StoredCredential;
  isPreview?: boolean;
}) => {
  const claims = parseClaims(data.parsedCredential);

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={elem} isPreview={isPreview} />
        </View>
      ))}
      <Divider />
      <ItwReleaserName credential={data} />
    </>
  );
};
