import * as pot from "@pagopa/ts-commons/lib/pot";
import { cieReducer, CieState } from "../../store/reducers/cie";
import {
  cieIsSupported,
  hasApiLevelSupport,
  hasNFCFeature,
  nfcIsEnabled,
  updateReadingState
} from "../../store/actions";

const INITIAL_STATE: CieState = {
  hasApiLevelSupport: pot.none,
  hasNFCFeature: pot.none,
  isCieSupported: pot.none,
  isNfcEnabled: pot.none,
  readingEvent: pot.none
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

  it("should handle hasApiLevelSupport.success", () => {
    const result = cieReducer(INITIAL_STATE, hasApiLevelSupport.success(true));
    expect(result.hasApiLevelSupport).toEqual(pot.some(true));
  });

  it("should handle hasApiLevelSupport.failure", () => {
    const error = new Error("API not supported");
    const result = cieReducer(INITIAL_STATE, hasApiLevelSupport.failure(error));
    expect(pot.isError(result.hasApiLevelSupport)).toBe(true);
  });

  it("should handle hasNFCFeature.success", () => {
    const result = cieReducer(INITIAL_STATE, hasNFCFeature.success(true));
    expect(result.hasNFCFeature).toEqual(pot.some(true));
  });

  it("should handle hasNFCFeature.failure", () => {
    const error = new Error("NFC not available");
    const result = cieReducer(INITIAL_STATE, hasNFCFeature.failure(error));
    expect(pot.isError(result.hasNFCFeature)).toBe(true);
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

  it("should handle updateReadingState.success", () => {
    const result = cieReducer(
      INITIAL_STATE,
      updateReadingState.success("READING")
    );
    expect(result.readingEvent).toEqual(pot.some("READING"));
  });

  it("should handle updateReadingState.failure", () => {
    const error = new Error("Reading failed");
    const result = cieReducer(INITIAL_STATE, updateReadingState.failure(error));
    expect(pot.isError(result.readingEvent)).toBe(true);
  });

  it("should return current state for unknown action", () => {
    const result = cieReducer(INITIAL_STATE, { type: "UNKNOWN" } as any);
    expect(result).toEqual(INITIAL_STATE);
  });
});
