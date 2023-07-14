import I18n from "../../../i18n";

export const ISSUER_URL = "https://www.interno.gov.it/pid/";

export type PidMockType = ReturnType<typeof getPidMock>;

export const getPidMock = () => ({
  verified_claims: {
    verification: {
      trust_framework: "eidas",
      assurance_level: "high",
      evidence: [
        {
          type: "electronic_record",
          record: {
            type: "eidas.it.cie",
            source: {
              organization_name: "Ministero dell'Interno",
              organization_id: "m_it",
              country_code: "IT"
            }
          }
        }
      ]
    },
    claims: {
      unique_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      given_name: "Anna",
      family_name: "Verdi",
      birthdate: "1978-12-30",
      place_of_birth: {
        country: "IT",
        locality: "Rome"
      },
      tax_id_number: "VRDBNC80A41H501X"
    }
  }
});

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
