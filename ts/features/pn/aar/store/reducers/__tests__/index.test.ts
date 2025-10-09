import { aarFlowReducer, INITIAL_AAR_FLOW_STATE } from "..";
import { isValidAARStateTransition } from "../../../utils/stateUtils";
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
        const state = aarFlowReducer(
          payload,
          terminateAarFlow({ messageId: "test" })
        );
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
