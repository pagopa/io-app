import { setLocale } from "../../../../../i18n";
import { groupCredentialClaims } from "../itwClaimsUtils";
import { ItwCredentialsMocks } from "../itwMocksUtils";

describe("groupCredentialClaims", () => {
  beforeAll(() => setLocale("it"));

  it("Groups claims in the appropriate sections for eID", () => {
    expect(groupCredentialClaims(ItwCredentialsMocks.eid)).toEqual({
      personalData: [
        { label: "Nome", value: "Casimira", id: "given_name" },
        { label: "Cognome", value: "Savoia", id: "family_name" },
        { label: "Data di Nascita", value: "1991-01-06", id: "birthdate" },
        {
          label: "Luogo di Nascita",
          value: { country: "IT", locality: "Rome" },
          id: "place_of_birth"
        },
        {
          label: "tax_id_number",
          value: "TAMMRA80A41H501I",
          id: "tax_id_number"
        },
        { label: "Codice Fiscale", id: "tax_id_code" }
      ],
      noSection: [
        { label: "Identificativo univoco", value: "idANPR", id: "unique_id" },
        {
          label: "evidence",
          value: [
            {
              type: "electronic_record",
              record: {
                type: "https://eudi.wallet.cie.gov.it",
                source: {
                  organization_name: "Ministero dell'Interno",
                  organization_id: "urn:eudi:it:organization_id:ipa_code:m_it",
                  country_code: "IT"
                }
              }
            }
          ],
          id: "evidence"
        }
      ]
    });
  });

  it("Groups claims in the appropriate sections for mDL", () => {
    expect(groupCredentialClaims(ItwCredentialsMocks.mdl)).toEqual({
      personalData: [
        { label: "Nome", value: "Casimira", id: "given_name" },
        { label: "Cognome", value: "Savoia", id: "family_name" },
        { label: "Data di nascita", value: "1991-01-06", id: "birthdate" },
        { label: "Foto", value: expect.any(String), id: "portrait" }
      ],
      documentData: [
        { label: "Data di rilascio", value: "2023-11-14", id: "issue_date" },
        { label: "Data di scadenza", value: "2024-02-22", id: "expiry_date" },
        {
          label: "Numero di documento",
          value: "XX1234567",
          id: "document_number"
        }
      ],
      noSection: [
        { label: "Paese di rilascio", value: "IT", id: "issuing_country" },
        {
          label: "AutoritÃ  di rilascio",
          value: "Istituto Poligrafico e Zecca dello Stato",
          id: "issuing_authority"
        },
        {
          label: "Segno distintivo UN",
          value: "I",
          id: "un_distinguishing_sign"
        },
        {
          label: "evidence",
          value: [
            {
              type: "electronic_record",
              record: {
                type: "https://eudi.wallet.pdnd.gov.it",
                source: {
                  organization_name: "Motorizzazione Civile",
                  organization_id: "urn:eudi:it:organization_id:ipa_code:m_inf",
                  country_code: "IT"
                }
              }
            }
          ],
          id: "evidence"
        }
      ],
      licenseData: [
        {
          label: "Categorie di veicoli",
          value: {
            issue_date: "2023-11-14",
            vehicle_category_code: "A",
            expiry_date: "2024-02-22"
          },
          id: "driving_privileges"
        }
      ]
    });
  });
});
