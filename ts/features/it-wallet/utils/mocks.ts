import { PidData } from "@pagopa/io-react-native-cie-pid";
import { IOIcons } from "@pagopa/io-app-design-system";
import { ImageSourcePropType } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import I18n from "../../../i18n";
import { BulletItem } from "../components/ItwBulletList";
import { ItwOptionalClaimItem } from "../components/ItwOptionalClaimsList";

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

export type CredentialCatalogDisplay = {
  textColor: "black" | "white";
  image: ImageSourcePropType;
  title: string;
  icon?: IOIcons;
  firstLine?: Array<string>;
  secondLine?: Array<string>;
  order?: Array<string>;
};

// A credential shown in the catalog but yet to be requested
export type CredentialCatalogIncomingItem = {
  incoming: true;
} & CredentialCatalogDisplay;

// A credential shown in the catalog that user can request
export type CredentialCatalogAvailableItem = {
  incoming: false;
  /* The type that defines the credential to be issued */
  type: string;
  /* The url of the issuer */
  issuerUrl: string;
} & CredentialCatalogDisplay;

export type CredentialCatalogItem =
  | CredentialCatalogAvailableItem
  | CredentialCatalogIncomingItem;

/**
 * Hard coded catalog of credentials.
 * It contains the display data for each credential type.
 * firstLine and secondLine are used to display the credential attributes in the credential card.
 * The order parameter is used to display the attributes in the correct order.
 */
export const CREDENTIALS_CATALOG: Array<CredentialCatalogItem> = [
  {
    type: "EuropeanDisabilityCard",
    issuerUrl: "https://api.eudi-wallet-it-issuer.it/rp",
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.disabilityCard"
    ),
    icon: "disabilityCard",
    incoming: false,
    textColor: "black",
    image: require("../assets/img/credentials/cards/europeanDisabilityCardFront.png"),
    firstLine: ["given_name", "family_name"],
    secondLine: ["serial_number"],
    order: [
      "given_name",
      "family_name",
      "birthdate",
      "accompanying_person_right",
      "expiration_date",
      "serial_number"
    ]
  },
  {
    incoming: true,
    title: I18n.t("features.itWallet.verifiableCredentials.type.healthCard"),
    icon: "healthCard",
    textColor: "black",
    image: require("../assets/img/credentials/cards/healthInsuranceFront.png"),
    firstLine: [],
    secondLine: []
  },
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.drivingLicense"
    ),
    icon: "driverLicense",
    incoming: true,
    textColor: "black",
    image: require("../assets/img/credentials/cards/drivingLicenseFront.png"),
    firstLine: [],
    secondLine: []
  }
];

/**
 * Hard coded display feature for PID
 */
export const pidDisplayData: CredentialCatalogDisplay = {
  title: I18n.t(
    "features.itWallet.verifiableCredentials.type.digitalCredential"
  ),
  icon: "archive",
  textColor: "white",
  image: require("../assets/img/credentials/cards/pidFront.png")
};

export const defaultDisplayData: CredentialCatalogDisplay = {
  title: I18n.t("features.itWallet.generic.credential"),
  icon: "archive",
  textColor: "black",
  image: require("../assets/img/credentials/cards/default.png"),
  firstLine: [],
  secondLine: []
};

export const getRequestedClaims = (
  decodedPid: PidWithToken
): ReadonlyArray<BulletItem> => [
  {
    title: I18n.t("features.itWallet.generic.dataSource.multi", {
      authSource:
        decodedPid.pid.verification.evidence[0].record.source.organization_name
    }),
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

const getMultipleRequestedClaims = (
  decodedPid: PidWithToken
): ReadonlyArray<BulletItem> => [
  {
    title: I18n.t("features.itWallet.generic.dataSource.multi", {
      authSource:
        decodedPid.pid.verification.evidence[0].record.source.organization_name
    }),
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
  },
  {
    title: I18n.t("features.itWallet.generic.dataSource.multi", {
      authSource: `${I18n.t("features.itWallet.generic.credential")} 1`
    }),
    data: [`${I18n.t("features.itWallet.generic.attribute")} 1`]
  }
];

export type RpMock = {
  organizationName: string;
  requestedClaims: (decodedPid: PidWithToken) => ReadonlyArray<BulletItem>;
  optionalClaims: ReadonlyArray<ItwOptionalClaimItem>;
};

export const rpMock: RpMock = {
  organizationName: "eFarma",
  requestedClaims: (decodedPid: PidWithToken) =>
    getMultipleRequestedClaims(decodedPid),
  optionalClaims: [
    {
      credential: `${I18n.t("features.itWallet.generic.credential")} 1`,
      claim: I18n.t("global.media.phone")
    },
    {
      credential: `${I18n.t("features.itWallet.generic.credential")} 1`,
      claim: I18n.t("global.media.email")
    }
  ]
};

/**
 * Regex to validate the date format of a credential.
 */
export const dateFormatRegex = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
