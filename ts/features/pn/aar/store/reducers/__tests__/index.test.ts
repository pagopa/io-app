import { aarFlowReducer, INITIAL_AAR_FLOW_STATE } from "..";
import {
  AARFlowStateName,
  isValidAARStateTransition
} from "../../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates,
  sendAarStateNames
} from "../../../utils/testUtils";
import {
  setAarFlowState,
  terminateAarFlow,
  TerminateAarFlowPayload
} from "../../actions";

describe("aarFlowReducer and related functions", () => {
  describe("Basic reducer behavior and selectors", () => {
    sendAarMockStates.forEach(payload => {
      [payload, "non_valid", undefined].forEach(actionParamFlowState => {
        it(`state '${payload.type}' should${
          actionParamFlowState === "non_valid" ? " not" : ""
        } reset upon receiving terminateAarFlow with ${
          actionParamFlowState === "non_valid" ? "an invalid" : "a valid"
        } flowState as parameter`, () => {
          const actionPayload: TerminateAarFlowPayload = {
            messageId: "test",
            currentFlowState: actionParamFlowState as
              | AARFlowStateName
              | undefined
          };
          const state = aarFlowReducer(
            payload,
            terminateAarFlow(actionPayload)
          );
          const shouldResetState =
            (actionParamFlowState ?? payload.type) === payload.type;

          if (shouldResetState) {
            expect(state).toEqual(INITIAL_AAR_FLOW_STATE);
          } else {
            expect(state).toEqual(payload);
          }
        });
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
