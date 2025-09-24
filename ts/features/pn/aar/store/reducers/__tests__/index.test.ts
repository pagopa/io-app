import * as O from "fp-ts/lib/Option";
import {
  aarFlowReducer,
  currentAARFlowData,
  currentAARFlowErrorKind,
  currentAARFlowStateType,
  INITIAL_AAR_FLOW_STATE,
  isAAREnabled
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as appVersion from "../../../../../../utils/appVersion";
import {
  aarErrors,
  AARFlowState,
  isValidAARStateTransition,
  sendAARFlowStates
} from "../../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates,
  sendAarStateNames
} from "../../../utils/testUtils";
import { setAarFlowState, terminateAarFlow } from "../../actions";

describe("aarFlowReducer and related functions", () => {
  describe("Basic reducer behavior and selectors", () => {
    sendAarMockStates.forEach(payload => {
      it(`state '${payload.type}' should reset upon receiving terminateAarFlow`, () => {
        const state = aarFlowReducer(payload, terminateAarFlow());
        expect(state).toEqual(INITIAL_AAR_FLOW_STATE);
      });
    });
  });

  describe("Transition validation in reducer", () => {
    sendAarStateNames.forEach(currentType => {
      sendAarStateNames.forEach(nextType => {
        const currentState = sendAarMockStateFactory[currentType]();
        const nextState = sendAarMockStateFactory[nextType]();
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

  describe(" selectors", () => {
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
      const resultType = currentAARFlowStateType(mockState);
      expect(resultType).toEqual(mockAARState.type);
      expect(result).toEqual(mockAARState);
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
      const resultType = currentAARFlowStateType(mockState);
      expect(result).toEqual(INITIAL_AAR_FLOW_STATE);
      expect(resultType).toEqual(INITIAL_AAR_FLOW_STATE.type);
    });

    it(`currentAARFlowErrorKind should return undefined when aarFlow.type!=='ko'`, () => {
      const mockState = {
        features: {
          pn: {
            aarFlow: {
              type: sendAARFlowStates.fetchingQRData,
              qrCode: "test"
            } as AARFlowState
          }
        }
      } as unknown as GlobalState;

      const resultErrorKind = currentAARFlowErrorKind(mockState);
      expect(resultErrorKind).toBeUndefined();
    });

    Object.values(aarErrors).forEach(errorKind =>
      it(`currentAARFlowErrorKind should return ${errorKind} when aarFlow={ type: 'ko', errorKind: '${errorKind}' }`, () => {
        const mockState = {
          features: {
            pn: {
              aarFlow: {
                type: sendAARFlowStates.ko,
                previousState: {},
                errorKind
              } as AARFlowState
            }
          }
        } as unknown as GlobalState;

        const resultErrorKind = currentAARFlowErrorKind(mockState);
        expect(resultErrorKind).toEqual(errorKind);
      })
    );
  });
});
