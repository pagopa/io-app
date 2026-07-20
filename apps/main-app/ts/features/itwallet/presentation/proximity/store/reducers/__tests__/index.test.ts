import {
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
      expect(state.consentManagementCredentialTypes).toEqual({ MDL: true });
      expect(Object.keys(state.consents)).toHaveLength(1);
    });

    it("should be a no-op when the same consent already exists", () => {
      const key = generateConsentKey(mdlConsent);
      const storedConsent = {
        ...mdlConsent,
        savedAt: "2026-07-19T12:00:00.000Z"
      };
      const stateWithConsent: ItwProximityState = {
        consentManagementCredentialTypes: { MDL: true },
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
        consentManagementCredentialTypes: { MDL: true },
        consents: { [key]: mdlConsent }
      };

      const state = reducer(
        stateWithConsent,
        itwRevokeProximityConsentByKey(key)
      );

      expect(state.consents).toEqual({});
      expect(state.consentManagementCredentialTypes).toEqual({ MDL: true });
    });

    it("should not affect other consents", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const multiKey = generateConsentKey(multiCredentialConsent);
      const stateWithConsents: ItwProximityState = {
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
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
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
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
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true
        },
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
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
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

  describe("itwCredentialsRemoveByType", () => {
    it("should remove all consents involving the removed credential type", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);

      const stateWithConsents: ItwProximityState = {
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
        consents: {
          [mdlKey]: mdlConsent,
          [healthKey]: healthCardOnlyConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwCredentialsRemoveByType("MDL", {})
      );

      expect(Object.keys(state.consents)).toHaveLength(1);
      expect(state.consents[healthKey]).toEqual(healthCardOnlyConsent);
      expect(state.consentManagementCredentialTypes).toEqual({
        EuropeanHealthInsuranceCard: true
      });
    });
  });

  describe("itwCredentialsReplaceByType", () => {
    it("should remove consents and the marker for the replaced credential type", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);
      const stateWithConsents: ItwProximityState = {
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
        consents: {
          [mdlKey]: mdlConsent,
          [healthKey]: healthCardOnlyConsent
        }
      };

      const state = reducer(
        stateWithConsents,
        itwCredentialsReplaceByType(
          [{ metadata: { credentialType: "MDL" } } as never],
          {}
        )
      );

      expect(state.consents).toEqual({
        [healthKey]: healthCardOnlyConsent
      });
      expect(state.consentManagementCredentialTypes).toEqual({
        EuropeanHealthInsuranceCard: true
      });
    });

    it("should be a no-op when the replacement payload is empty", () => {
      const state = reducer(
        itwProximityInitialState,
        itwCredentialsReplaceByType([], {})
      );

      expect(state).toBe(itwProximityInitialState);
    });
  });

  describe("itwLifecycleStoresReset", () => {
    it("should reset all consents", () => {
      const mdlKey = generateConsentKey(mdlConsent);
      const healthKey = generateConsentKey(healthCardOnlyConsent);

      const stateWithConsents: ItwProximityState = {
        consentManagementCredentialTypes: {
          EuropeanHealthInsuranceCard: true,
          MDL: true
        },
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
