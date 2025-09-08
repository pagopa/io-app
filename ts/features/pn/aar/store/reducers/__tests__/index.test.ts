import * as O from "fp-ts/lib/Option";
import {
  aarFlowReducer,
  AARFlowState,
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
});
