import { initialMixpanelState, mixpanelReducer, MixpanelState } from "..";
import { Action } from "../../../../../store/actions/types";
import { setIsMixpanelInitialized } from "../../actions";

describe("index", () => {
  describe("initialMixpanelState", () => {
    it("should match expected values", () => {
      expect(initialMixpanelState).toEqual({
        isMixpanelInitialized: false
      });
    });
  });
  describe("mixpanelReducer", () => {
    it("should return expected state for undefined input and unrelated action", () => {
      const output = mixpanelReducer(undefined, {} as Action);
      expect(output).toEqual({
        isMixpanelInitialized: false
      });
    });
    [false, true].forEach(isInitialized =>
      it(`should return expected output for input action 'setIsMixpanelInitialized' with payload '${isInitialized}'`, () => {
        const inputState: MixpanelState = {
          isMixpanelInitialized: !isInitialized
        };
        const inputAction = setIsMixpanelInitialized(isInitialized);
        const output = mixpanelReducer(inputState, inputAction);
        expect(output).toEqual({
          isMixpanelInitialized: isInitialized
        });
      })
    );
  });
});
