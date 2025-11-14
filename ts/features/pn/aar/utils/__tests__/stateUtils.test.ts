import {
  isValidAARStateTransition,
  maybeIunFromAarFlowState,
  sendAARFlowStates,
  validAARStatusTransitions
} from "../stateUtils";
import { sendAarMockStates, sendAarStateNames } from "../testUtils";

describe("stateUtils", () => {
  describe("isValidAARStateTransition function", () => {
    sendAarStateNames.forEach(currentType => {
      sendAarStateNames.forEach(nextType => {
        const allowedNextStates = validAARStatusTransitions.get(currentType);
        const isAllowed = allowedNextStates?.has(nextType) ?? false;
        it(
          isAllowed
            ? `Should allow a valid from '${currentType}' to '${nextType}'`
            : `Should reject an invalid from '${currentType}' to '${nextType}'`,
          () => {
            expect(isValidAARStateTransition(currentType, nextType)).toBe(
              isAllowed
            );
          }
        );
      });
    });
  });
  describe("snapshots", () => {
    it("validTransitions", () => {
      expect(validAARStatusTransitions).toMatchSnapshot();
    });
    it("flowStates", () => {
      expect(sendAARFlowStates).toMatchSnapshot();
    });
  });
  describe("maybeIunFromAarFlowState", () => {
    it("should handle all the possible states", () => {
      sendAarMockStates.forEach(state => {
        switch (state.type) {
          case sendAARFlowStates.notAddresseeFinal:
          case sendAARFlowStates.fetchingNotificationData:
          case sendAARFlowStates.displayingNotificationData:
            expect(maybeIunFromAarFlowState(state)).toBe(state.iun);
            break;
          case sendAARFlowStates.ko:
            expect(maybeIunFromAarFlowState(state)).toBe(
              maybeIunFromAarFlowState(state.previousState)
            );
            break;
          default:
            expect(maybeIunFromAarFlowState(state)).toBeUndefined();
            break;
        }
      });
    });
  });
});
