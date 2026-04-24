import * as pot from "@pagopa/ts-commons/lib/pot";
import { type GlobalState } from "../../../../../../store/reducers/types";
import { DigitalCredentialsCatalogue } from "../../../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwAvailableCredentialsListSelector,
  itwCredentialsCatalogueByTypesSelector
} from "..";

const mockCatalogue = {
  taxonomy_uri: "",
  exp: 1700000000,
  iat: 1600000000,
  credentials: [
    {
      credential_type: "cred1",
      name: "Credential 1",
      description: "Description for Credential 1"
    },
    {
      credential_type: "cred2",
      name: "Credential 2",
      description: "Description for Credential 2"
    }
  ] as DigitalCredentialsCatalogue["credentials"]
};

describe("itwCredentialsCatalogueByTypesSelector", () => {
  it("should return a dictionary mapping credential types to their metadata", () => {
    const mockState = {
      features: {
        itWallet: {
          credentialsCatalogue: {
            catalogue: pot.some(mockCatalogue)
          }
        }
      }
    } as GlobalState;

    expect(itwCredentialsCatalogueByTypesSelector(mockState)).toEqual({
      cred1: {
        credential_type: "cred1",
        name: "Credential 1",
        description: "Description for Credential 1"
      },
      cred2: {
        credential_type: "cred2",
        name: "Credential 2",
        description: "Description for Credential 2"
      }
    });
  });
});
describe("itwAvailableCredentialsListSelector", () => {
  it("should return the list of credentials from the catalogue when it is enabled", () => {
    const mockState = {
      features: {
        itWallet: {
          credentialsCatalogue: {
            isEnabledForCredentialsList: true,
            catalogue: pot.some(mockCatalogue)
          }
        }
      }
    } as GlobalState;

    expect(itwAvailableCredentialsListSelector(mockState)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credential 2" }
    ]);
  });

  it("should return the list of hardcoded credentials when the catalogue is not enabled", () => {
    const mockState = {
      features: {
        itWallet: {
          credentialsCatalogue: {
            isEnabledForCredentialsList: false,
            catalogue: pot.some(mockCatalogue)
          }
        }
      }
    } as GlobalState;

    expect(itwAvailableCredentialsListSelector(mockState)).toEqual([
      { name: "Patente di guida", type: "mDL" },
      {
        name: "Carta Europea della Disabilità",
        type: "EuropeanDisabilityCard"
      },
      {
        name: "Tessera Sanitaria - Tessera europea di assicurazione malattia",
        type: "EuropeanHealthInsuranceCard"
      },
      { name: "Titoli accademici", type: "education_degree" },
      { name: "Iscrizioni accademiche", type: "education_enrollment" },
      { name: "Attestato di residenza", type: "residency" },
      { name: "Diplomi", type: "education_diploma" },
      { name: "Frequenza scolastica", type: "education_attendance" }
    ]);
  });
});
