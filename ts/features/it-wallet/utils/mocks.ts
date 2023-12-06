import { PidData } from "@pagopa/io-react-native-cie-pid";
import { IOIcons } from "@pagopa/io-app-design-system";
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
/**
 * Credentials Catalog mocks.
 */

export const CREDENTIAL_ISSUER = "eFarma";

/**
 * Credential types mocks.
 */
export enum CredentialType {
  EUROPEAN_HEALTH_INSURANCE_CARD = "EuropeanHealthInsuranceCard",
  EUROPEAN_DISABILITY_CARD = "EuropeanDisabilityCard",
  DRIVING_LICENSE = "DrivingLicense",
  PID = "PID"
}

export type CredentialCatalogDisplay = {
  textColor: "black" | "white";
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
export const getCredentialsCatalog = (): Array<CredentialCatalogItem> => [
  {
    type: CredentialType.EUROPEAN_DISABILITY_CARD,
    issuerUrl: "https://api.eudi-wallet-it-issuer.it/rp",
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.disabilityCard"
    ),
    icon: "disabilityCard",
    incoming: false,
    textColor: "black",
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
    type: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    issuerUrl: "https://api.eudi-wallet-it-issuer.it/rp",
    incoming: false,
    title: I18n.t("features.itWallet.verifiableCredentials.type.healthCard"),
    icon: "healthCard",
    textColor: "black",
    firstLine: ["given_name", "family_name"],
    secondLine: ["fiscal_code"],
    order: [
      "given_name",
      "family_name",
      "birthdate",
      "place_of_birth",
      "sex",
      "fiscal_code",
      "expiry_date",
      "province",
      "nation",
      "institution_number_team",
      "document_number_team"
    ]
  },
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.drivingLicense"
    ),
    icon: "driverLicense",
    incoming: true,
    textColor: "black",
    firstLine: [],
    secondLine: []
  }
];

/**
 * Returns the mocked background image for the credential.
 * @param type - the credential type
 * @returns the mocked background image.
 */
export const getImageFromCredentialType = (type: string) => {
  switch (type) {
    case CredentialType.EUROPEAN_DISABILITY_CARD:
      return require("../assets/img/credentials/cards/europeanDisabilityCardFront.png");
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return require("../assets/img/credentials/cards/europeanHealthInsuranceCardFront.png");
    case CredentialType.PID:
      return require("../assets/img/credentials/cards/pidFront.png");
    default:
      return require("../assets/img/credentials/cards/default.png");
  }
};

/**
 * Hard coded display feature for PID
 */
export const getPidDisplayData = (): CredentialCatalogDisplay => ({
  title: I18n.t(
    "features.itWallet.verifiableCredentials.type.digitalCredential"
  ),
  icon: "archive",
  textColor: "white"
});

export const getRequestedClaims = (
  decodedPid: PidWithToken
): ReadonlyArray<BulletItem> => [
  {
    title: I18n.t("features.itWallet.generic.dataSource.multi", {
      authSource:
        decodedPid.pid.verification.evidence[0].record.source.organization_name
    }),
    data: [
      I18n.t("features.itWallet.verifiableCredentials.claims.givenName"),
      I18n.t("features.itWallet.verifiableCredentials.claims.familyName"),
      I18n.t("features.itWallet.verifiableCredentials.claims.taxIdCode"),
      I18n.t("features.itWallet.verifiableCredentials.claims.birthdate"),
      I18n.t("features.itWallet.verifiableCredentials.claims.placeOfBirth")
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
      I18n.t("features.itWallet.verifiableCredentials.claims.givenName"),
      I18n.t("features.itWallet.verifiableCredentials.claims.familyName"),
      I18n.t("features.itWallet.verifiableCredentials.claims.taxIdCode"),
      I18n.t("features.itWallet.verifiableCredentials.claims.birthdate"),
      I18n.t("features.itWallet.verifiableCredentials.claims.placeOfBirth")
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

export const getRpMock = (): RpMock => ({
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
});

export const rpPidMock: RpMock = {
  organizationName: "Comune di Milano",
  requestedClaims: (decodedPid: PidWithToken) => getRequestedClaims(decodedPid),
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
 * This is mocked because the date format is not yet defined.
 */
export const dateFormatRegex = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
