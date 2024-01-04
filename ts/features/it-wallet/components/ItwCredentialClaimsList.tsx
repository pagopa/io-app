import React from "react";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "../../../i18n";
import { CredentialCatalogDisplay } from "../utils/mocks";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { ParsedCredential, StoredCredential } from "../utils/types";
import { getClaimsFullLocale } from "../utils/itwClaimsUtils";
import ItwCredentialClaim from "./ItwCredentialClaim";

export type Claim = {
  label: string;
  value: unknown;
};

/**
 * Type of the claims list.
 * Consists of a list of claims, each claim is a couple of label and value.
 */
export type ClaimList = Array<Claim>;

/**
 * Parses the claims from the credential.
 * For each Record entry it maps the key and the attribute value to a label and a value.
 * The label is taken from the attribute name which is either a string or a record of locale and string.
 * If the type of the attribute name is string then when take it's value because locales have not been set.
 * If the type of the attribute name is record then we take the value of the locale that matches the current locale.
 * If there's no locale that matches the current locale then we take the attribute key as the name.
 * The value is taken from the attribute value.
 * @param parsedCredential - the parsed credential.
 * @param schema - the issuance credentialConfigurationSchema of parsedCredential.
 * @returns the {@link ClaimList} of the credential contained in its configuration schema.
 */
const parseClaims = (parsedCredential: ParsedCredential): ClaimList =>
  Object.entries(parsedCredential).map(([key, attribute]) => {
    const attributeName =
      typeof attribute.name === "string"
        ? attribute.name
        : attribute.name[getClaimsFullLocale()] || key;

    return { label: attributeName, value: attribute.value };
  });

/**
 * Sorts the parsedCredential according to the order of the displayData.
 * If the order is not available, the schema is returned as is.
 * @param parsedCredential - the parsed credential.
 * @param order - the order of the displayData.
 * @returns a new parsedCredential sorted according to the order of the displayData.
 */
const sortClaims = (
  order: CredentialCatalogDisplay["order"],
  parsedCredential: ParsedCredential
) =>
  order
    ? Object.fromEntries(
        Object.entries(parsedCredential)
          .slice()
          .sort(([key1], [key2]) => order.indexOf(key1) - order.indexOf(key2))
      )
    : parsedCredential;

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
const ItwCredentialClaimsList = ({
  data: { parsedCredential, displayData, issuerConf }
}: {
  data: StoredCredential;
}) => {
  const claims = parseClaims(sortClaims(displayData.order, parsedCredential));

  const releaserName = issuerConf.federation_entity.organization_name;

  /**
   * Renders the releaser name with an info button that opens the bottom sheet.
   * This is not part of the claims list because it's not a claim.
   * Thus it's rendered separately.
   * @param releaserName - the releaser name.
   * @returns the list item with the releaser name.
   */
  const RenderReleaserName = ({ releaserName }: { releaserName: string }) => {
    const label = I18n.t(
      "features.itWallet.verifiableCredentials.claims.releasedBy"
    );
    const releasedByBottomSheet = useItwInfoBottomSheet({
      title:
        releaserName ??
        I18n.t("features.itWallet.generic.placeholders.organizationName"),
      content: [
        {
          title: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.title"
          ),
          body: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.subtitle"
          )
        },
        {
          title: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.title"
          ),
          body: I18n.t(
            "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.subtitle"
          )
        }
      ]
    });
    return (
      <>
        <ListItemInfo
          endElement={{
            type: "iconButton",
            componentProps: {
              icon: "info",
              accessibilityLabel: "test",
              onPress: () => releasedByBottomSheet.present()
            }
          }}
          label={label}
          value={releaserName}
          accessibilityLabel={`${label} ${releaserName}`}
        />
        {releasedByBottomSheet.bottomSheet}
      </>
    );
  };

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <ItwCredentialClaim claim={elem} />
        </View>
      ))}
      {releaserName && (
        <>
          <RenderReleaserName releaserName={releaserName} />
        </>
      )}
    </>
  );
};

export default ItwCredentialClaimsList;
