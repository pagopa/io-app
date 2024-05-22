import React from "react";
import { View } from "react-native";
import { parseClaims, sortClaims } from "../utils/itwClaimsUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwReleaserName } from "./ItwReleaserName";
import { ItwPidAssuranceLevel } from "./ItwPidAssuranceLevel";

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
export const ItwCredentialClaimsList = ({
  data
}: {
  data: StoredCredential;
}) => {
  const { parsedCredential, displayData } = data;

  const claims = parseClaims(sortClaims(displayData.order, parsedCredential));

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim claim={elem} />
        </View>
      ))}
      <ItwReleaserName credential={data} />
      <ItwPidAssuranceLevel credential={data} />
    </>
  );
};
