import _ from "lodash";
import { appReducer } from "..";
import { resetDebugData, setDebugData } from "../../actions/debug";
import { debugDataSelector } from "../debug";

describe("debug", () => {
  it("should allow to set only object with string keys", () => {
    // @ts-expect-error - Should not be allowed to set a string
    setDebugData("string");
    // @ts-expect-error - Should not be allowed to set a number
    setDebugData(1);
    // @ts-expect-error - Should not be allowed to set a boolean
    setDebugData(true);
    // @ts-expect-error - Should not be allowed to set a symbol
    setDebugData(Symbol("symbol"));
    // @ts-expect-error - Should not be allowed to set a function
    setDebugData(() => null);
    // @ts-expect-error - Should not be allowed to set a array
    setDebugData(["string"]);
    // @ts-expect-error - Should not be allowed to set an object
    setDebugData(new Date());
  });
  it("should return the debug data without the undefined values", () => {
    const state = appReducer(
      _.merge(undefined, {
        debug: {
          isDebugModeEnabled: true,
          debugData: {}
        }
      }),
      setDebugData({ not_visible: undefined, visible: "visible" })
    );
    expect(debugDataSelector(state)).toEqual({ visible: "visible" });
  });
  it("should remove the debug data when resetDebugData is called", () => {
    const state = appReducer(
      _.merge(undefined, {
        debug: {
          isDebugModeEnabled: true,
          debugData: { A: "A", B: "B", C: "C" }
        }
      }),
      resetDebugData(["A", "B"])
    );
    expect(debugDataSelector(state)).toEqual({ C: "C" });
  });
  it("should merge and/or override data", () => {
    const state = appReducer(
      _.merge(undefined, {
        debug: {
          isDebugModeEnabled: true,
          debugData: { A: "A", B: "B", C: "C" }
        }
      }),
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
});
