import { appReducer } from "..";
import { resetDebugData, setDebugData } from "../../actions/debug";
import { debugDataSelector } from "../debug";

describe("debug", () => {
  it("should return the debug data without the undefined values", () => {
    const state = appReducer(
      {
        debug: {
          isDebugModeEnabled: true,
          debugData: {}
        }
      } as any,
      setDebugData({ not_visible: undefined, visible: "visible" })
    );
    expect(debugDataSelector(state)).toEqual({ visible: "visible" });
  });
  it("should remove the debug data when resetDebugData is called", () => {
    const state = appReducer(
      {
        debug: {
          isDebugModeEnabled: true,
          debugData: { A: "A", B: "B", C: "C" }
        }
      } as any,
      resetDebugData(["A", "B"])
    );
    expect(debugDataSelector(state)).toEqual({ C: "C" });
  });
  it("should merge and/or override data", () => {
    const state = appReducer(
      {
        debug: {
          isDebugModeEnabled: true,
          debugData: { A: "A", B: "B", C: "C" }
        }
      } as any,
      setDebugData({ C: "Updated!", D: "D", E: "E" })
    );
    expect(debugDataSelector(state)).toEqual({
      A: "A",
      B: "B",
      C: "Updated!",
      D: "D",
      E: "E"
    });
  });
  it("should remove undefined values", () => {
    const state = appReducer(
      {
        debug: {
          isDebugModeEnabled: true,
          debugData: { A: "A", B: "B", C: "C" } // <- C has a value
        }
      } as any,
      setDebugData({ C: undefined, D: "D", E: "E" }) // <- C is updated to undefined
    );
    expect(debugDataSelector(state)).toEqual({
      A: "A",
      B: "B",
      D: "D",
      E: "E"
    });
  });
});
