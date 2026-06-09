import * as pot from "@pagopa/ts-commons/lib/pot";
import { cieReducer, CieState } from "../../store/reducers/cie";
import { cieIsSupported, nfcIsEnabled } from "../../store/actions";

const INITIAL_STATE: CieState = {
  isCieSupported: pot.none,
  isNfcEnabled: pot.none
};

describe("cieReducer", () => {
  it("should handle cieIsSupported.success", () => {
    const result = cieReducer(INITIAL_STATE, cieIsSupported.success(true));
    expect(result.isCieSupported).toEqual(pot.some(true));
  });

  it("should handle cieIsSupported.failure", () => {
    const error = new Error("CIE not supported");
    const result = cieReducer(INITIAL_STATE, cieIsSupported.failure(error));
    expect(pot.isError(result.isCieSupported)).toBe(true);
  });

  it("should handle nfcIsEnabled.success", () => {
    const result = cieReducer(INITIAL_STATE, nfcIsEnabled.success(true));
    expect(result.isNfcEnabled).toEqual(pot.some(true));
  });

  it("should handle nfcIsEnabled.failure", () => {
    const error = new Error("NFC check failed");
    const result = cieReducer(INITIAL_STATE, nfcIsEnabled.failure(error));
    expect(pot.isError(result.isNfcEnabled)).toBe(true);
  });

  it("should return current state for unknown action", () => {
    const result = cieReducer(INITIAL_STATE, { type: "UNKNOWN" } as any);
    expect(result).toEqual(INITIAL_STATE);
  });
});
