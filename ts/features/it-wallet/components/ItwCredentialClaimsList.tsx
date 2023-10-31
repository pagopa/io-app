import React from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { IssuanceResultData } from "../store/reducers/new/itwIssuanceReducer";

type ClaimList = ReadonlyArray<readonly [string, string]>;

const parseClaims = (
  parsedCredential: IssuanceResultData["parsedCredential"],
  schema: IssuanceResultData["schema"]
): ClaimList =>
  Object.entries(schema.credentialSubject)
    /* 
  TODO: select locale
  .map(([key, definitions]) =>
    definitions.display.filter(_ => _.locale === I18n.locale)
  ) */
    .map(
      ([key, { display }]) => [display[0].name, parsedCredential[key]] as const
    );

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param credential - contains the credential.
 * @param claims - contains the claim to be displayed.
 * @param onLinkPress - function to be called for the issuer info action. To be passed only if claims contains the issuedByNew claim.
 */
const ItwCredentialClaimsList = ({
  data: { parsedCredential, schema }
}: {
  data: IssuanceResultData;
}) => {
  const claims = parseClaims(parsedCredential, schema);

  return (
    <>
      {claims.map(
        ([label, value], index, _, key = `${index}_${label}` /* 🥷 */) => (
          <View key={key}>
            <ListItemInfo
              label={label}
              value={value}
              accessibilityLabel={`${label} ${value}`}
            />
            <Divider />
          </View>
        )
      )}
    </>
  );
};

export default ItwCredentialClaimsList;
