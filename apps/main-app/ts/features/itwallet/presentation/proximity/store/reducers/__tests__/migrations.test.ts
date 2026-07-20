import { createMigrate, PersistedState } from "redux-persist";

import { ConsentData, StoredConsentData } from "../../types";
import { generateConsentKey } from "../../utils";
import { itwProximityStateMigrations } from "../migrations";

const mdlConsent: ConsentData = {
  credentials: [{ claimNames: ["family_name"], credentialType: "MDL" }],
  rpId: "rp-001"
};

const multiCredentialConsent: ConsentData = {
  credentials: [
    { claimNames: ["given_name"], credentialType: "MDL" },
    {
      claimNames: ["insurance_id"],
      credentialType: "EuropeanHealthInsuranceCard"
    }
  ],
  rpId: "rp-002"
};

describe("itwProximityStateMigrations", () => {
  const migrate = createMigrate(itwProximityStateMigrations);

  it("derives credential management markers from legacy consents", async () => {
    const legacyState = {
      _persist: { rehydrated: true, version: -1 },
      consents: {
        [generateConsentKey(mdlConsent)]: mdlConsent,
        [generateConsentKey(multiCredentialConsent)]: multiCredentialConsent
      }
    } as PersistedState;

    const migratedState = await migrate(legacyState, 0);

    expect(migratedState).toEqual({
      ...legacyState,
      consentManagementCredentialTypes: {
        EuropeanHealthInsuranceCard: true,
        MDL: true
      }
    });
    expect(
      Object.values(
        (migratedState as { consents: Record<string, StoredConsentData> })
          .consents
      ).every(consent => consent.savedAt === undefined)
    ).toBe(true);
  });

  it("creates an empty marker when the legacy store has no consents", async () => {
    const legacyState = {
      _persist: { rehydrated: true, version: -1 },
      consents: {}
    } as PersistedState;

    await expect(migrate(legacyState, 0)).resolves.toEqual({
      ...legacyState,
      consentManagementCredentialTypes: {}
    });
  });
});
