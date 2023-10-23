import { PidData } from "@pagopa/io-react-native-cie-pid";
import { IOIcons } from "@pagopa/io-app-design-system";
import { ImageSourcePropType } from "react-native";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import I18n from "../../../i18n";
import { BulletItem } from "../components/ItwBulletList";
import ItwCredentialCard from "../components/ItwCredentialCard";
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

export type CredentialCatalogItem = {
  title: string;
  icon: IOIcons;
  incoming: boolean;
  claims: {
    issuedByNew: string;
    expirationDate: string;
    givenName: string;
    familyName: string;
    taxIdCode: string;
    birthdate: string;
  };
  textColor: React.ComponentProps<typeof ItwCredentialCard>["textColor"];
  image: ImageSourcePropType;
  requestedClaims: (decodedPid: PidWithToken) => ReadonlyArray<BulletItem>;
};

export const CREDENTIALS_CATALOG: Array<CredentialCatalogItem> = [
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.disabilityCard"
    ),
    icon: "disabilityCard",
    incoming: false,
    claims: {
      issuedByNew: "Istituto Poligrafico e Zecca dello Stato",
      expirationDate: "30.12.2028",
      givenName: "Anna",
      familyName: "Verdi",
      taxIdCode: "VRDBNC80A41H501X",
      birthdate: "30/12/1978"
    },
    textColor: "black",
    image: require("../assets/img/credentials/cards/europeanDisabilityCardFront.png"),
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  },
  {
    title: I18n.t("features.itWallet.verifiableCredentials.type.healthCard"),
    icon: "healthCard",
    incoming: false,
    claims: {
      issuedByNew: "Ragioneria Generale dello Stato",
      expirationDate: "30.12.2028",
      givenName: "Anna",
      familyName: "Verdi",
      taxIdCode: "VRDBNC80A41H501X",
      birthdate: "30/12/1978"
    },
    textColor: "black",
    image: require("../assets/img/credentials/cards/healthInsuranceFront.png"),
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  },
  {
    title: I18n.t(
      "features.itWallet.verifiableCredentials.type.drivingLicense"
    ),
    icon: "driverLicense",
    incoming: true,
    claims: {
      issuedByNew: "Istituto Poligrafico e Zecca dello Stato",
      expirationDate: "30.12.2028",
      givenName: "Anna",
      familyName: "Verdi",
      taxIdCode: "VRDBNC80A41H501X",
      birthdate: "30/12/1978"
    },
    textColor: "black",
    image: require("../assets/img/credentials/cards/drivingLicenseFront.png"),
    requestedClaims: (decodedPid: PidWithToken) =>
      getRequestedClaims(decodedPid)
  }
];

const getRequestedClaims = (
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
      credential: "Credenziale 1",
      claim: I18n.t("global.media.phone")
    },
    {
      credential: "Credenziale 1",
      claim: I18n.t("global.media.email")
    }
  ]
};
