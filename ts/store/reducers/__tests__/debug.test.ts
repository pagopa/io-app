import { resetDebugData, setDebugData } from "../../actions/debug";
import { debugReducer } from "../debug";

describe("debug", () => {
  it("should return the debug data without the undefined values", () => {
    const state = debugReducer(
      undefined,
      setDebugData({ not_visible: undefined, visible: "visible" })
    );
    expect(state.debugData).toEqual({ visible: "visible" });
  });
  it("should remove the debug data when resetDebugData is called", () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: false,
        debugData: { A: "A", B: "B", C: "C" }
      },
      resetDebugData(["A", "B"])
    );
    expect(state.debugData).toEqual({ C: "C" });
  });
  it("should merge and/or override data", () => {
    const state = debugReducer(
      {
        isDebugModeEnabled: false,
        debugData: { A: "A", B: "B", C: "C" }
      },
      setDebugData({ C: "Updated!", D: "D", E: "E" })
    );
    expect(state.debugData).toEqual({
      A: "A",
      B: "B",
      C: "Updated!",
      D: "D",
      E: "E"
    });
  });
});
