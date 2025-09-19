import {
  isValidAARStateTransition,
  sendAARFlowStates,
  validAARStatusTransitions
} from "../stateUtils";
import { sendAarStateNames } from "../testUtils";

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
});
