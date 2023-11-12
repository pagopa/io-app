import React from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import * as O from "fp-ts/Option";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import { IssuanceResultData } from "../store/reducers/new/itwIssuanceReducer";
import { getClaimsFullLocale } from "../utils/locales";
import I18n from "../../../i18n";
import { CredentialCatalogDisplay } from "../utils/mocks";

/**
 * Type of the claims list.
 * Consists of a list of claims, each claim is a couple of label and value
 * wrapped in an Option.
 */
type ClaimList = ReadonlyArray<{
  value: O.Option<string>;
  label: O.Option<string>;
}>;

/**
 * Decoder type for the evidence field of the credential.
 */
const EvidenceDecoder = t.array(
  t.type({
    type: t.string,
    record: t.type({
      type: t.string,
      source: t.type({
        organization_name: t.string,
        organization_id: t.string,
        country_code: t.string
      })
    })
  })
);

/**
 * Parses the claims from the credential.
 * It uses the credentialConfigurationSchema to get the label for each claim by
 * creating an object with its entries and then mapping them to a list of claims.
 * The key of the object is used to get the value from the parsedCredential.
 * If the value is not available, the value is set to undefined which is then
 * wrapped in an Option.
 * The value of the object is used to get the label from the credentialConfigurationSchema
 * by filtering the display array for the current locale.
 * If the label is not available for the current locale, the label is set to undefined which is then
 * wrapped in an Option.
 * The resulting list of claims is then flattened by two levels to get a list of claims.
 * @param parsedCredential - the parsed credential.
 * @param schema - the issuance credentialConfigurationSchema of parsedCredential.
 * @returns the list of claims of the credential contained in its configuration schema.
 */
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
 * Sorts the schema according to the order of the displayData.
 * If the order is not available, the schema is returned as is.
 * @param schema - the issuance credentialConfigurationSchema of parsedCredential.
 * @param order - the order of the displayData.
 * @returns schema sorted according to the order of the displayData.
 */
const sortSchema = (
  schema: IssuanceResultData["credentialConfigurationSchema"],
  order: CredentialCatalogDisplay["order"]
) =>
  order
    ? Object.fromEntries(
        Object.entries(schema)
          .slice()
          .sort(([key1], [key2]) => order.indexOf(key1) - order.indexOf(key2))
      )
    : schema;

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link IssuanceResultData} of the credential.
 */
const ItwCredentialClaimsList = ({
  data: { parsedCredential, credentialConfigurationSchema, displayData }
}: {
  data: IssuanceResultData;
}) => {
  const claims = parseClaims(
    parsedCredential,
    sortSchema(credentialConfigurationSchema, displayData.order)
  );

  /**
   * Renders the issuer name from the evidence field of the credential.
   * It uses the EvidenceDecoder to decode the evidence field.
   * @param evidence - the evidence field of the credential.
   * @returns the list item with the issuer name or an empty fragment if the evidence field is not available.
   */
  const RenderIssuerName = ({ evidence }: { evidence: string }) =>
    pipe(
      EvidenceDecoder.decode(JSON.parse(evidence)),
      E.fold(
        () => <></>,
        result => {
          const label = I18n.t(
            "features.itWallet.verifiableCredentials.claims.releasedBy"
          );
          const value = result[0].record.source.organization_name;
          return (
            <>
              <ListItemInfo
                label={label}
                value={value}
                accessibilityLabel={`${label} ${value}`}
              />
              <Divider />
            </>
          );
        }
      )
    );

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
      {parsedCredential.evidence && (
        <RenderIssuerName evidence={parsedCredential.evidence} />
      )}
    </>
  );
};

export default ItwCredentialClaimsList;
