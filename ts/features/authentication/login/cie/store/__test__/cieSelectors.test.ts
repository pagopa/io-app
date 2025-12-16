import * as pot from "@pagopa/ts-commons/lib/pot";
import * as selectors from "../selectors";

describe("CIE selectors", () => {
  const baseState = {
    features: {
      loginFeatures: {
        cieLogin: {
          useUat: true,
          isCieIDTourGuideEnabled: false,
          cieIDSelectedSecurityLevel: "SpidL2"
        }
      }
    },
    cie: {
      isCieSupported: pot.toError(pot.none, new Error("fail")),
      isNfcEnabled: pot.some(false)
    }
  } as any;

  it("should return correct value for isCieLoginUatEnabledSelector", () => {
    expect(selectors.isCieLoginUatEnabledSelector(baseState)).toBe(true);
  });

  it("should return correct value for isCieIDTourGuideEnabledSelector", () => {
    expect(selectors.isCieIDTourGuideEnabledSelector(baseState)).toBe(false);
  });

  it("should return correct value for cieIDSelectedSecurityLevelSelector", () => {
    expect(selectors.cieIDSelectedSecurityLevelSelector(baseState)).toBe(
      "SpidL2"
    );
  });

  it("should return correct value for isCieSupportedSelector", () => {
    expect(selectors.isCieSupportedSelector(baseState).kind).toBe(
      "PotNoneError"
    );
  });

  it("should return correct value for isNfcEnabledSelector", () => {
    expect(selectors.isNfcEnabledSelector(baseState)).toEqual(pot.some(false));
  });
});
