import {
  aarFlowReducer,
  AARFlowState,
  currentAARFlowStateData,
  currentAARFlowStateType,
  INITIAL_AAR_FLOW_STATE,
  isValidAARStateTransition,
  sendAARFlowStates
} from "..";
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
      const globalState = {
        features: {
          pn: {
            aarFlow: payload
          }
        }
      } as any;

      it(`state '${payload.type}' should reset upon receiving terminateAarFlow`, () => {
        const state = aarFlowReducer(payload, terminateAarFlow());
        expect(state).toEqual(INITIAL_AAR_FLOW_STATE);
      });

      it(`currentAARFlowStateType should return '${payload.type}'`, () => {
        const currentAARType = currentAARFlowStateType(globalState);
        expect(currentAARType).toBe(payload.type);
      });

      it(`currentAARFlowStateData should return the full state`, () => {
        const currentAARData = currentAARFlowStateData(globalState);
        expect(currentAARData).toBe(payload);
      });
    });
  });

  describe("Transition validation in reducer", () => {
    allStateTypes.forEach(currentType => {
      allStateTypes.forEach(nextType => {
        const currentState = stateFactories[currentType]();
        const nextState = stateFactories[nextType]();
        const action = setAarFlowState(nextState);

        const shouldAllow = isValidAARStateTransition(currentState, nextState);

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
    it("should allow a valid transition", () => {
      const from = stateFactories.none();
      const to = stateFactories.displayingAARToS();
      expect(isValidAARStateTransition(from, to)).toBe(true);
    });

    it("should reject an invalid transition", () => {
      const from = stateFactories.none();
      const to = stateFactories.ko();
      expect(isValidAARStateTransition(from, to)).toBe(false);
    });
  });
});
