import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  ConsentData,
  ConsentManagementCredentialTypes,
  StoredConsentData
} from "../../types";
import { generateConsentKey } from "../../utils";
import {
  itwProximityConsentByKeySelector,
  itwProximityConsentExistsSelector,
  itwProximityConsentsByCredentialTypeSelector,
  itwProximityConsentsByRpIdSelector,
  itwProximityConsentsEntriesByCredentialTypeSelector,
  itwProximityConsentsEntriesSelector,
  itwProximityConsentsSelector,
  itwProximityShouldShowConsentManagementSelector
} from "../consents";

const mdlConsent: ConsentData = {
  rpId: "rp-001",
  credentials: [
    {
      credentialType: "MDL",
      claimNames: ["firstName", "lastName", "birthDate"]
    }
  ]
};

const multiCredentialConsent: ConsentData = {
  rpId: "rp-001",
  credentials: [
    {
      credentialType: "MDL",
      claimNames: ["firstName", "birthDate"]
    },
    {
      credentialType: "EuropeanHealthInsuranceCard",
      claimNames: ["insuranceId"]
    }
  ]
};

const healthCardOnlyConsent: ConsentData = {
  rpId: "rp-002",
  credentials: [
    {
      credentialType: "EuropeanHealthInsuranceCard",
      claimNames: ["insuranceId", "holderName"]
    }
  ]
};

const buildState = (
  consents: Record<string, StoredConsentData>,
  consentManagementCredentialTypes: ConsentManagementCredentialTypes = {}
): Pick<GlobalState, "features"> =>
  ({
    features: {
      itWallet: {
        proximity: {
          consentManagementCredentialTypes,
          consents
        }
      }
    }
  }) as unknown as Pick<GlobalState, "features">;

describe("proximity consent selectors", () => {
  const mdlKey = generateConsentKey(mdlConsent);
  const multiKey = generateConsentKey(multiCredentialConsent);
  const healthKey = generateConsentKey(healthCardOnlyConsent);

  const stateWithConsents = buildState({
    [mdlKey]: mdlConsent,
    [multiKey]: multiCredentialConsent,
    [healthKey]: healthCardOnlyConsent
  });

  const emptyState = buildState({});

  describe("itwProximityConsentsSelector", () => {
    it("should return all consents as an array", () => {
      const result = itwProximityConsentsSelector(
        stateWithConsents as GlobalState
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          mdlConsent,
          multiCredentialConsent,
          healthCardOnlyConsent
        ])
      );
    });

    it("should return an empty array when there are no consents", () => {
      const result = itwProximityConsentsSelector(emptyState as GlobalState);

      expect(result).toEqual([]);
    });
  });

  describe("itwProximityConsentsEntriesSelector", () => {
    it("should return all consents with their generated keys", () => {
      const result = itwProximityConsentsEntriesSelector(
        stateWithConsents as GlobalState
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          [mdlKey, mdlConsent],
          [multiKey, multiCredentialConsent],
          [healthKey, healthCardOnlyConsent]
        ])
      );
    });
  });

  describe("itwProximityConsentsEntriesByCredentialTypeSelector", () => {
    it("filters by credential type and sorts dated entries newest first with legacy entries last", () => {
      const newestConsent: StoredConsentData = {
        ...mdlConsent,
        rpId: "rp-newest",
        savedAt: "2026-07-20T12:00:00.000Z"
      };
      const olderConsent: StoredConsentData = {
        ...multiCredentialConsent,
        rpId: "rp-older",
        savedAt: "2026-07-19T12:00:00.000Z"
      };
      const legacyConsent: StoredConsentData = {
        ...mdlConsent,
        rpId: "rp-legacy"
      };
      const unrelatedConsent: StoredConsentData = {
        ...healthCardOnlyConsent,
        rpId: "rp-unrelated",
        savedAt: "2026-07-21T12:00:00.000Z"
      };
      const newestKey = generateConsentKey(newestConsent);
      const olderKey = generateConsentKey(olderConsent);
      const legacyKey = generateConsentKey(legacyConsent);
      const state = buildState({
        [legacyKey]: legacyConsent,
        [olderKey]: olderConsent,
        [generateConsentKey(unrelatedConsent)]: unrelatedConsent,
        [newestKey]: newestConsent
      });

      const result = itwProximityConsentsEntriesByCredentialTypeSelector("MDL")(
        state as GlobalState
      );

      expect(result).toEqual([
        [newestKey, newestConsent],
        [olderKey, olderConsent],
        [legacyKey, legacyConsent]
      ]);
    });

    it("returns an empty array when no consent involves the credential", () => {
      const result = itwProximityConsentsEntriesByCredentialTypeSelector(
        "NonExistentType"
      )(stateWithConsents as GlobalState);

      expect(result).toEqual([]);
    });
  });

  describe("itwProximityConsentByKeySelector", () => {
    it("returns the consent matching the deterministic key", () => {
      expect(
        itwProximityConsentByKeySelector(mdlKey)(
          stateWithConsents as GlobalState
        )
      ).toEqual(mdlConsent);
    });

    it("returns undefined when the key does not exist", () => {
      expect(
        itwProximityConsentByKeySelector("missing")(
          stateWithConsents as GlobalState
        )
      ).toBeUndefined();
    });
  });

  describe("itwProximityShouldShowConsentManagementSelector", () => {
    it("returns true when the credential marker exists without active consents", () => {
      const state = buildState({}, { MDL: true });

      expect(
        itwProximityShouldShowConsentManagementSelector("MDL")(
          state as GlobalState
        )
      ).toBe(true);
    });

    it("returns false when the credential marker does not exist", () => {
      expect(
        itwProximityShouldShowConsentManagementSelector("MDL")(
          emptyState as GlobalState
        )
      ).toBe(false);
    });
  });

  describe("itwProximityConsentsByCredentialTypeSelector", () => {
    it("should return all consents involving the specified credential type", () => {
      const result = itwProximityConsentsByCredentialTypeSelector("MDL")(
        stateWithConsents as GlobalState
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([mdlConsent, multiCredentialConsent])
      );
    });

    it("should return only consents for a credential type exclusive to one consent", () => {
      const result = itwProximityConsentsByCredentialTypeSelector(
        "EuropeanHealthInsuranceCard"
      )(stateWithConsents as GlobalState);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([multiCredentialConsent, healthCardOnlyConsent])
      );
    });

    it("should return an empty array when no consents match", () => {
      const result = itwProximityConsentsByCredentialTypeSelector(
        "NonExistentType"
      )(stateWithConsents as GlobalState);

      expect(result).toEqual([]);
    });
  });

  describe("itwProximityConsentExistsSelector", () => {
    it("should return true when the consent exists", () => {
      const result = itwProximityConsentExistsSelector(mdlConsent)(
        stateWithConsents as GlobalState
      );

      expect(result).toBe(true);
    });

    it("should return true regardless of claim order", () => {
      const reorderedConsent: ConsentData = {
        rpId: "rp-001",
        credentials: [
          {
            credentialType: "MDL",
            claimNames: ["birthDate", "lastName", "firstName"]
          }
        ]
      };

      const result = itwProximityConsentExistsSelector(reorderedConsent)(
        stateWithConsents as GlobalState
      );

      expect(result).toBe(true);
    });

    it("should return false when the consent does not exist", () => {
      const nonExistentConsent: ConsentData = {
        rpId: "rp-999",
        credentials: [{ credentialType: "MDL", claimNames: ["firstName"] }]
      };

      const result = itwProximityConsentExistsSelector(nonExistentConsent)(
        stateWithConsents as GlobalState
      );

      expect(result).toBe(false);
    });

    it("should return false when a claim differs", () => {
      const differentClaimsConsent: ConsentData = {
        rpId: "rp-001",
        credentials: [
          {
            credentialType: "MDL",
            claimNames: ["firstName", "lastName", "fiscalCode"]
          }
        ]
      };

      const result = itwProximityConsentExistsSelector(differentClaimsConsent)(
        stateWithConsents as GlobalState
      );

      expect(result).toBe(false);
    });

    it("should return false when only a single credential from a multi-credential consent matches", () => {
      const singleCredentialConsent: ConsentData = {
        rpId: multiCredentialConsent.rpId,
        credentials: [multiCredentialConsent.credentials[0]]
      };

      const result = itwProximityConsentExistsSelector(singleCredentialConsent)(
        stateWithConsents as GlobalState
      );

      expect(result).toBe(false);
    });
  });

  describe("itwProximityConsentsByRpIdSelector", () => {
    it("should return all consents for the specified RP", () => {
      const result = itwProximityConsentsByRpIdSelector("rp-001")(
        stateWithConsents as GlobalState
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([mdlConsent, multiCredentialConsent])
      );
    });

    it("should return a single consent when only one matches the RP", () => {
      const result = itwProximityConsentsByRpIdSelector("rp-002")(
        stateWithConsents as GlobalState
      );

      expect(result).toHaveLength(1);
      expect(result).toEqual([healthCardOnlyConsent]);
    });

    it("should return an empty array when no consents match the RP", () => {
      const result = itwProximityConsentsByRpIdSelector("rp-999")(
        stateWithConsents as GlobalState
      );

      expect(result).toEqual([]);
    });
  });
});
