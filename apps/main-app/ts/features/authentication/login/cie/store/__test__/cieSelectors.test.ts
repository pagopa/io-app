import * as pot from "@pagopa/ts-commons/lib/pot";

import { AUTH_LEVELS } from "../../../../common/utils";
import * as selectors from "../selectors";

describe("CIE selectors", () => {
  const baseState = {
    features: {
      loginFeatures: {
        cieLogin: {
          useUat: true,
          isCieIDTourGuideEnabled: false,
          cieIDSelectedSecurityLevel: AUTH_LEVELS.L2
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
      AUTH_LEVELS.L2
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
