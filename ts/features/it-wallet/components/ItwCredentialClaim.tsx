import React from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { View } from "react-native";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import {
  ClaimValue,
  EvidenceClaim,
  PlaceOfBirthClaim,
  PlaceOfBirthClaimType,
  TextClaim
} from "../utils/itwClaimsUtils";
import I18n from "../../../i18n";
import { localeDateFormat } from "../../../utils/locale";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { Claim } from "./ItwCredentialClaimsList";

/**
 * Component which renders a place of birth type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const PlaceOfBirthClaimItem = (label: string, claim: PlaceOfBirthClaimType) => {
  const value = `${claim.locality} (${claim.country})`;
  return (
    <View key={`${label}-${value}`}>
      <ListItemInfo label={label} value={value} accessibilityLabel={value} />
      <Divider />
    </View>
  );
};

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const TextClaimItem = (label: string, claim: string) => (
  <View key={`${label}-${claim}`}>
    <ListItemInfo
      label={label}
      value={claim}
      accessibilityLabel={`${label} ${claim}`}
    />
    <Divider />
  </View>
);

/**
 * Component which renders a date type claim.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 */
const DateClaimItem = (label: string, claim: Date) => {
  const value = localeDateFormat(
    claim,
    I18n.t("global.dateFormats.shortFormat")
  );
  return (
    <View key={`${label}-${value}`}>
      <ListItemInfo
        label={label}
        value={value}
        accessibilityLabel={`${label} ${value}`}
      />
      <Divider />
    </View>
  );
};

/**
 * Component which renders a evidence type claim.
 * It features a bottom sheet with information about the issuer of the claim.
 * @param issuerName - the organization name of the issuer of the evidence claim.
 */
const EvidenceClaimItem = (issuerName: string) => {
  const issuedByBottomSheet = useItwInfoBottomSheet({
    title: issuerName,
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
      {issuedByBottomSheet.bottomSheet}
      <Divider />
    </>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * Currently supported types are:
 * - PlaceOfBirthClaim
 * - TextClaim
 * - DateFromString
 * - EvidenceClaim
 * @param claim - the claim to render
 */
const ItwCredentialClaim = ({ claim }: { claim: Claim }) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => null,
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return PlaceOfBirthClaimItem(claim.label, decoded);
        } else if (TextClaim.is(decoded)) {
          return TextClaimItem(claim.label, decoded);
        } else if (DateFromString.is(decoded)) {
          return DateClaimItem(claim.label, decoded);
        } else if (EvidenceClaim.is(decoded)) {
          return EvidenceClaimItem(decoded[0].record.source.organization_name);
        } else {
          return null;
        }
      }
    )
  );

export default ItwCredentialClaim;
