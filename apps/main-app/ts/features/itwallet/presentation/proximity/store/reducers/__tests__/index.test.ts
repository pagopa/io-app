import {
  itwCredentialsRemove,
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType
} from "../../../../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../../../../lifecycle/store/actions";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsentByKey,
  itwRevokeProximityConsentsByCredentialType,
  itwRevokeProximityConsentsByRpId
} from "../../actions";
import { ConsentData } from "../../types";
import { generateConsentKey } from "../../utils";
import {
  itwProximityInitialState,
  ItwProximityState,
  itwProximityReducer as reducer
} from "../index";

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
  rpId: "rp-002",
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
  rpId: "rp-003",
  credentials: [
    {
      credentialType: "EuropeanHealthInsuranceCard",
      claimNames: ["insuranceId", "holderName"]
    }
  ]
};

const disabilityCardOnlyConsent: ConsentData = {
  rpId: "rp-004",
  credentials: [
    {
      credentialType: "EuropeanDisabilityCard",
      claimNames: ["disabilityCardId"]
    }
  ]
};

const credentialRemovalRequestScenarios = [
  {
    action: itwCredentialsRemoveByType("MDL", {}),
    name: "removal"
  },
  {
    action: itwCredentialsReplaceByType(
      [{ metadata: { credentialType: "MDL" } } as never],
      {}
    ),
    name: "replacement"
  }
];

describe("itwProximityReducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, { type: "UNKNOWN" } as never)).toEqual(
      itwProximityInitialState
    );
  });

  describe("itwGrantProximityConsent", () => {
    it("should add a new consent", () => {
      const state = reducer(
        itwProximityInitialState,
        itwGrantProximityConsent(mdlConsent)
      );
      const key = generateConsentKey(mdlConsent);

      expect(state.consents[key]).toEqual({
        ...mdlConsent,
        savedAt: expect.any(String)
      });
      expect(Object.keys(state.consents)).toHaveLength(1);
    });

    it("should be a no-op when the same consent already exists", () => {
      const key = generateConsentKey(mdlConsent);
      const storedConsent = {
        ...mdlConsent,
        savedAt: "2026-07-19T12:00:00.000Z"
      };
      const stateWithConsent: ItwProximityState = {
        consents: { [key]: storedConsent }
      };

      const nextState = reducer(
        stateWithConsent,
        itwGrantProximityConsent(mdlConsent)
      );

      expect(nextState).toBe(stateWithConsent);
      expect(nextState.consents[key]).toBe(storedConsent);
    });

    it("should add multiple different consents", () => {
      const stateAfterFirst = reducer(
        itwProximityInitialState,
        itwGrantProximityConsent(mdlConsent)
      );
      const stateAfterSecond = reducer(
        stateAfterFirst,
        itwGrantProximityConsent(multiCredentialConsent)
      );

      expect(Object.keys(stateAfterSecond.consents)).toHaveLength(2);
    });

    it("should generate the same key regardless of claim order", () => {
      const consentA: ConsentData = {
        rpId: "rp-001",
        credentials: [
          { credentialType: "MDL", claimNames: ["birthDate", "firstName"] }
        ]
      };
      const consentB: ConsentData = {
        rpId: "rp-001",
        credentials: [
          { credentialType: "MDL", claimNames: ["firstName", "birthDate"] }
        ]
      };

      const stateA = reducer(
        itwProximityInitialState,
        itwGrantProximityConsent(consentA)
      );
      const stateB = reducer(stateA, itwGrantProximityConsent(consentB));

      expect(Object.keys(stateB.consents)).toHaveLength(1);
    });
  });

  describe("itwRevokeProximityConsentByKey", () => {
    it("should remove the consent with the specified key", () => {
      const key = generateConsentKey(mdlConsent);
      const stateWithConsent: ItwProximityState = {
        consents: { [key]: mdlConsent }
      };

      const state = reducer(
        stateWithConsent,
        itwRevokeProximityConsentByKey(key)
      );

      expect(state.consents).toEqual({});
    });

    it("should not affect other consents", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const multiKey = generateConsentKey(multiCredentialConsent);
      const stateWithConsents: ItwProximityState = {
        consents: {
          [mdlKey]: mdlConsent,
          [multiKey]: multiCredentialConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwRevokeProximityConsentByKey(mdlKey)
      );

      expect(Object.keys(state.consents)).toHaveLength(1);
      expect(state.consents[multiKey]).toEqual(multiCredentialConsent);
    });

    it("should be a no-op when revoking a non-existent key", () => {
      const state = reducer(
        itwProximityInitialState,
        itwRevokeProximityConsentByKey("non-existent-key")
      );

      expect(state.consents).toEqual({});
    });
  });

  describe("itwRevokeProximityConsentsByCredentialType", () => {
    it("should remove all consents involving the specified credential type", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const multiKey = generateConsentKey(multiCredentialConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);

      const stateWithConsents: ItwProximityState = {
        consents: {
          [mdlKey]: mdlConsent,
          [multiKey]: multiCredentialConsent,
          [healthKey]: healthCardOnlyConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwRevokeProximityConsentsByCredentialType("MDL")
      );

      // mdlConsent and multiCredentialConsent both involve MDL
      expect(Object.keys(state.consents)).toHaveLength(1);
      expect(state.consents[healthKey]).toEqual(healthCardOnlyConsent);
    });

    it("should not affect consents without the specified credential type", () => {
      const healthKey = generateConsentKey(healthCardOnlyConsent);
      const stateWithConsent: ItwProximityState = {
        consents: { [healthKey]: healthCardOnlyConsent }
      };

      const state = reducer(
        stateWithConsent,
        itwRevokeProximityConsentsByCredentialType("MDL")
      );

      expect(Object.keys(state.consents)).toHaveLength(1);
    });
  });

  describe("itwRevokeProximityConsentsByRpId", () => {
    it("should remove all consents for the specified RP ID", () => {
      const multiCredentialConsentForSameRpId: ConsentData = {
        ...multiCredentialConsent,
        rpId: "rp-001"
      };
      const mdlKey = generateConsentKey(mdlConsent);
      const multiKey = generateConsentKey(multiCredentialConsentForSameRpId);
      const healthKey = generateConsentKey(healthCardOnlyConsent);

      const stateWithConsents: ItwProximityState = {
        consents: {
          [mdlKey]: mdlConsent,
          [multiKey]: multiCredentialConsentForSameRpId,
          [healthKey]: healthCardOnlyConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwRevokeProximityConsentsByRpId("rp-001")
      );

      expect(Object.keys(state.consents)).toHaveLength(1);
      expect(state.consents[healthKey]).toEqual(healthCardOnlyConsent);
    });
  });

  describe("credential removal", () => {
    test.each(credentialRemovalRequestScenarios)(
      "should not clear consents when the $name is requested",
      ({ action }) => {
        const mdlKey = generateConsentKey(mdlConsent);
        const stateWithConsents: ItwProximityState = {
          consents: {
            [mdlKey]: mdlConsent
          }
        };

        const state = reducer(stateWithConsents, action);

        expect(state).toBe(stateWithConsents);
      }
    );

    it("should clear consents only after credential removal succeeds", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const multiKey = generateConsentKey(multiCredentialConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);
      const disabilityKey = generateConsentKey(disabilityCardOnlyConsent);
      const stateWithConsents: ItwProximityState = {
        consents: {
          [mdlKey]: mdlConsent,
          [multiKey]: multiCredentialConsent,
          [healthKey]: healthCardOnlyConsent,
          [disabilityKey]: disabilityCardOnlyConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwCredentialsRemove([
          { credentialType: "MDL" } as never,
          { credentialType: "EuropeanHealthInsuranceCard" } as never
        ])
      );

      expect(state.consents).toEqual({
        [disabilityKey]: disabilityCardOnlyConsent
      });
    });

    it("should be a no-op when no credential is removed", () => {
      const state = reducer(itwProximityInitialState, itwCredentialsRemove([]));

      expect(state).toBe(itwProximityInitialState);
    });
  });

  describe("itwLifecycleStoresReset", () => {
    it("should reset all consents", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);

      const stateWithConsents: ItwProximityState = {
        consents: {
          [mdlKey]: mdlConsent,
          [healthKey]: healthCardOnlyConsent
        }
      };

      const state = reducer(stateWithConsents, itwLifecycleStoresReset());

      expect(state).toEqual(itwProximityInitialState);
      expect(state.consents).toEqual({});
    });
  });
});
