import {
  aarErrors,
  isAarErrorRetriable,
  isAarErrorState,
  isValidAARStateTransition,
  sendAARFlowStates,
  testable,
  validAARStatusTransitions
} from "../stateUtils";
import { sendAarMockStates, sendAarStateNames } from "../testUtils";

const { finalErrors, retriableErrors } = testable!;

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
  describe("isAarErrorRetriable", () => {
    Object.values(retriableErrors).forEach(value => {
      it(`should return true for retriable error: ${value}`, () => {
        const error = aarErrors[value];
        expect(isAarErrorRetriable(error)).toBe(true);
      });
    });

    Object.values(finalErrors).forEach(value => {
      it(`should return false for final (non-retriable) error: ${value}`, () => {
        const error = aarErrors[value];
        expect(isAarErrorRetriable(error)).toBe(false);
      });
    });
  });
  describe("isAarErrorState", () => {
    sendAarMockStates.forEach(state => {
      const isError = state.type === sendAARFlowStates.ko;
      it(`should return '${isError}' when state have type='${state.type}'`, () => {
        expect(isAarErrorState(state)).toBe(isError);
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
    it("aarErrors", () => {
      expect(aarErrors).toMatchSnapshot();
    });
  });
});
