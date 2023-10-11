import { PidData } from "@pagopa/io-react-native-cie-pid";
import { IOIcons } from "@pagopa/io-app-design-system";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import I18n from "../../../i18n";
import { BulletItem } from "../components/ItwBulletList";

export const ISSUER_URL = "https://www.interno.gov.it/pid/";

export const pidDataMock: PidData = {
  name: "Mario",
  surname: "Rossi",
  fiscalCode: "RSSMRA80L05F593A",
  birthDate: "1980-01-10"
};

enum AssuranceLevel {
  HIGH = "high"
}

export const mapAssuranceLevel = (level: AssuranceLevel | string) => {
  switch (level) {
    case AssuranceLevel.HIGH:
      return I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevels.high"
      );
    default:
      return I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevels.na"
      );
  }
};

export const FEDERATION_ENTITY = {
  organization_name: "Comune di Milano",
  homepage_uri: "https://www.comune.milano.it/",
  policy_uri: "https://www.comune.milano.it/privacy",
  logo_uri: "https://www.comune.milano.it/logo.png",
  contacts: "https://www.comune.milano.it/contacts"
};

/**
 * Credentials Catalog mocks.
 */

export const CREDENTIAL_ISSUER = "eFarma";

export type CredentialCatalogItem = {
  title: string;
  icon: IOIcons;
  incoming: boolean;
  requestedClaims: (decodedPid: PidWithToken) => ReadonlyArray<BulletItem>;
};

export const CREDENTIALS_CATALOG: Array<CredentialCatalogItem> = [
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.disabilityCard"
    ),
    icon: "disabilityCard",
    incoming: false,
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  },
  {
    title: I18n.t("features.itWallet.verifiableCredentials.type.healthCard"),
    icon: "healthCard",
    incoming: false,
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  },
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.drivingLicense"
    ),
    icon: "driverLicense",
    incoming: true,
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  }
];

const getRequestedClaims = (
  decodedPid: PidWithToken
): ReadonlyArray<BulletItem> => [
  {
    title: I18n.t(
      "features.itWallet.issuing.credentialsIssuingInfoScreen.dataSource",
      {
        authsource:
          decodedPid.pid.verification.evidence[0].record.source
            .organization_name
      }
    ),
    data: [
      `${I18n.t("features.itWallet.verifiableCredentials.claims.givenName")} ${
        decodedPid.pid.claims.givenName
      }`,
      `${I18n.t("features.itWallet.verifiableCredentials.claims.familyName")} ${
        decodedPid.pid.claims.familyName
      }`,
      `${I18n.t("features.itWallet.verifiableCredentials.claims.taxIdCode")} ${
        decodedPid.pid.claims.taxIdCode
      }`,
      `${I18n.t("features.itWallet.verifiableCredentials.claims.birthdate")} ${
        decodedPid.pid.claims.birthdate
      }`,
      `${I18n.t(
        "features.itWallet.verifiableCredentials.claims.placeOfBirth"
      )} ${decodedPid.pid.claims.placeOfBirth.locality} (${
        decodedPid.pid.claims.placeOfBirth.country
      })`
    ]
  }
];
