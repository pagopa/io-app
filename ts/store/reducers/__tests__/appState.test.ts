import MockDate from "mockdate";
import { applicationChangeState } from "../../actions/application";
import appState, { initialAppState } from "../appState";

MockDate.set("2023-01-01T01:00:00");
const mockTimestamp = 1672534800000; // 2023-01-01T01:00:00

describe("appState reducer", () => {
  it("should have a valid initial state", () => {
    expect(appState(undefined, {} as any)).toEqual(initialAppState);
  });

  it("should handle APPLICATION_STATE_CHANGE_ACTION", () => {
    const action = applicationChangeState("inactive");
    expect(appState(undefined, action)).toEqual({
      appState: "inactive",
      timestamp: mockTimestamp
    });
  });
});
