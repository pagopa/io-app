import * as O from "fp-ts/lib/Option";
import {
  aarFlowReducer,
  AARFlowState,
  currentAARFlowData,
  INITIAL_AAR_FLOW_STATE,
  isAAREnabled,
  isValidAARStateTransition,
  sendAARFlowStates,
  validAARStatusTransitions
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as appVersion from "../../../../../../utils/appVersion";
import { setAarFlowState, terminateAarFlow } from "../../actions";

const stateFactories: Record<AARFlowState["type"], () => AARFlowState> = {
  none: () => ({ type: "none" }),
  displayingAARToS: () => ({
    type: "displayingAARToS",
    qrCode: "https://www.google.com"
  }),
  fetchingQRData: () => ({
    type: "fetchingQRData",
    qrCode: "https://www.google.com"
  }),
  fetchingNotificationData: () => ({
    type: "fetchingNotificationData",
    iun: "000000000001",
    fullNameDestinatario: "Mario Rossi"
  }),
  displayingNotificationData: () => ({
    type: "displayingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    notification: {}
  }),
  notAddresseeFinal: () => ({
    type: "notAddresseeFinal",
    fullNameDestinatario: "Mario Rossi",
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  ko: () => ({
    type: "ko",
    errorKind: "CIE REJECTED",
    previousState: { type: "none" }
  })
};

const allStateTypes = Object.values(sendAARFlowStates);

describe("aarFlowReducer and related functions", () => {
  describe("Basic reducer behavior and selectors", () => {
    const mockStates = allStateTypes.map(t => stateFactories[t]());

    mockStates.forEach(payload => {
      it(`state '${payload.type}' should reset upon receiving terminateAarFlow`, () => {
        const state = aarFlowReducer(payload, terminateAarFlow());
        expect(state).toEqual(INITIAL_AAR_FLOW_STATE);
      });
    });
  });

  describe("Transition validation in reducer", () => {
    allStateTypes.forEach(currentType => {
      allStateTypes.forEach(nextType => {
        const currentState = stateFactories[currentType]();
        const nextState = stateFactories[nextType]();
        const action = setAarFlowState(nextState);

        const shouldAllow = isValidAARStateTransition(
          currentState.type,
          nextState.type
        );

        it(`should ${
          shouldAllow ? "allow" : "reject"
        } transition from '${currentType}' to '${nextType}'`, () => {
          const result = aarFlowReducer(currentState, action);
          if (shouldAllow) {
            expect(result).toEqual(nextState);
          } else {
            expect(result).toEqual(currentState);
          }
        });
      });
    });
  });

  describe("isValidAARStateTransition function", () => {
    allStateTypes.forEach(currentType => {
      allStateTypes.forEach(nextType => {
        const allowedNextStates = validAARStatusTransitions.get(currentType);
        const isAllow = allowedNextStates?.has(nextType) ?? false;
        it(
          isAllow
            ? `Should allow a valid from '${currentType}' to '${nextType}'`
            : `Should reject an invalid from '${currentType}' to '${nextType}'`,
          () => {
            expect(isValidAARStateTransition(currentType, nextType)).toBe(
              isAllow
            );
          }
        );
      });
    });
  });
});

describe("isAAREnabled selector", () => {
  [
    { local: true, remote: true, expect: true },
    { local: true, remote: false, expect: false },
    { local: false, remote: true, expect: false },
    { local: false, remote: false, expect: false }
  ].forEach(({ local, remote, expect: expected }) => {
    it(`Should return ${expected} when isAARLocalEnabled='${local}' and isAARRemoteEnabled='${remote}'`, () => {
      const state = {
        persistedPreferences: {
          isAarFeatureEnabled: local
        },
        remoteConfig: O.some({
          pn: {
            aar: {
              min_app_version: {
                android: remote ? "1.0.0.0" : "3.0.0.0",
                ios: remote ? "1.0.0.0" : "3.0.0.0"
              }
            }
          }
        })
      } as GlobalState;
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "2.0.0.0");

      const isAarFeatureEnabled = isAAREnabled(state);
      expect(isAarFeatureEnabled).toBe(expected);
    });
  });

  describe("currentAARFlowData selector", () => {
    it("should return the correct AAR flow state from the global state", () => {
      const mockAARState: AARFlowState = {
        type: "fetchingNotificationData",
        iun: "1234567890",
        fullNameDestinatario: "Mario Rossi"
      };

      const mockState = {
        features: {
          pn: {
            aarFlow: mockAARState
          }
        }
      } as unknown as GlobalState;

      const result = currentAARFlowData(mockState);
      expect(result).toEqual(mockAARState);
    });

    it("should return undefined if aarFlow is not present", () => {
      const mockState = {
        features: {
          pn: {}
        }
      } as unknown as GlobalState;

      const result = currentAARFlowData(mockState);
      expect(result).toBeUndefined();
    });

    it("should return INITIAL_AAR_FLOW_STATE when explicitly set", () => {
      const mockState = {
        features: {
          pn: {
            aarFlow: INITIAL_AAR_FLOW_STATE
          }
        }
      } as unknown as GlobalState;

      const result = currentAARFlowData(mockState);
      expect(result).toEqual(INITIAL_AAR_FLOW_STATE);
    });
  });
});
