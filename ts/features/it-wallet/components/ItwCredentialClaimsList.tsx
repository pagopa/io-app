import React from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import * as O from "fp-ts/Option";
import { IssuanceResultData } from "../store/reducers/new/itwIssuanceReducer";
import { getClaimsFullLocale } from "../utils/locales";
import I18n from "../../../i18n";

type ClaimList = ReadonlyArray<{
  value: O.Option<string>;
  label: O.Option<string>;
}>;

const parseClaims = (
  parsedCredential: IssuanceResultData["parsedCredential"],
  schema: IssuanceResultData["credentialConfigurationSchema"]
): ClaimList =>
  Object.entries(schema)
    .map(([key, elem]) => ({
      value: O.fromNullable(parsedCredential[key]),
      label: O.fromNullable(
        elem.display.filter(e => e.locale === getClaimsFullLocale())[0]?.name
      )
    }))
    .flat(2);

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param credential - contains the credential.
 * @param claims - contains the claim to be displayed.
 * @param onLinkPress - function to be called for the issuer info action. To be passed only if claims contains the issuedByNew claim.
 */
const ItwCredentialClaimsList = ({
  data: { parsedCredential, credentialConfigurationSchema }
}: {
  data: IssuanceResultData;
}) => {
  const claims = parseClaims(parsedCredential, credentialConfigurationSchema);

  return (
    <>
      {claims.map(
        ({ label, value }, index, _, key = `${index}_${label}` /* 🥷 */) => (
          <View key={key}>
            <ListItemInfo
              label={O.getOrElse(() =>
                I18n.t(
                  "features.itWallet.generic.placeholders.claimLabelNotAvailable"
                )
              )(label)}
              value={O.getOrElse(() =>
                I18n.t(
                  "features.itWallet.generic.placeholders.claimNotAvailable"
                )
              )(value)}
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
