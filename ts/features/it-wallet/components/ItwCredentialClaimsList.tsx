import React from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import { getClaimsFullLocale } from "../utils/locales";
import I18n from "../../../i18n";
import { CredentialCatalogDisplay } from "../utils/mocks";
import { StoredCredential } from "../store/reducers/itwCredentialsReducer";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { ParsedCredential } from "../utils/types";

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

  const evidence = EvidenceClaimDecoder.decode(
    claims.find(claim => claim.label === "evidence")?.value
  );
  const releaserName = issuerConf.federation_entity.organization_name;

  /**
   * Bottom sheet for the issuer name.
   */
  const issuedByBottomSheet = useItwInfoBottomSheet({
    title: pipe(
      evidence,
      E.fold(
        () => I18n.t("features.itWallet.generic.placeholders.organizationName"),
        right => right[0].record.source.organization_name
      )
    ),
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

  /**
   * Bottom sheet for the releaser name.
   */
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

  /**
   * Renders the issuer name with an info button that opens the bottom sheet.
   * @param issuerName - the issuer name.
   * @returns the list item with the issuer name.
   */
  const RenderIssuerName = ({ issuerName }: { issuerName: string }) => {
    const label = I18n.t(
      "features.itWallet.verifiableCredentials.claims.issuedByNew"
    );
    return (
      <>
        <ListItemInfo
          endElement={{
            type: "iconButton",
            componentProps: {
              icon: "info",
              accessibilityLabel: "test",
              onPress: () => issuedByBottomSheet.present()
            }
          }}
          label={label}
          value={issuerName}
          accessibilityLabel={`${label} ${issuerName}`}
        />
        <Divider />
      </>
    );
  };

  /**
   * Renders the releaser name with an info button that opens the bottom sheet.
   * @param releaserName - the releaser name.
   * @returns the list item with the releaser name.
   */
  const RenderReleaserName = ({ releaserName }: { releaserName: string }) => {
    const label = I18n.t(
      "features.itWallet.verifiableCredentials.claims.releasedBy"
    );
    return (
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
    );
  };

  return (
    <>
      {claims.map(
        ({ label, value }, index, _, key = `${index}_${label}` /* 🥷 */) =>
          pipe(
            value,
            StringClaimDecoder.decode,
            E.fold(
              () => null,
              () => (
                <View key={key}>
                  <ListItemInfo
                    label={label}
                    value={value}
                    accessibilityLabel={`${label} ${value}`}
                  />
                  <Divider />
                </View>
              )
            )
          )
      )}
      {E.isRight(evidence) && (
        <>
          <RenderIssuerName
            issuerName={evidence.right[0].record.source.organization_name}
          />
          {issuedByBottomSheet.bottomSheet}
        </>
      )}
      {releaserName && (
        <>
          <RenderReleaserName releaserName={releaserName} />
          {releasedByBottomSheet.bottomSheet}
        </>
      )}
    </>
  );
};

export default ItwCredentialClaimsList;
