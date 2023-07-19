import { applicationChangeState } from "../../actions/application";
import appState, { initialAppState } from "../appState";

describe("appState reducer", () => {
  it("should have a valid initial state", () => {
    expect(appState(undefined, {} as any)).toEqual(initialAppState);
  });

  it("should handle APPLICATION_STATE_CHANGE_ACTION", () => {
    const action = applicationChangeState("inactive");
    expect(appState(undefined, action)).toEqual({
      appState: "inactive"
    });
  });
});
