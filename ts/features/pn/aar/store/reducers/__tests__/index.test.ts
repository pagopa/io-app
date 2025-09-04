import {
  aarFlowReducer,
  AARFlowState,
  INITIAL_AAR_FLOW_STATE,
  isValidAARStateTransition,
  sendAARFlowStates,
  validAARStatusTransitions
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
