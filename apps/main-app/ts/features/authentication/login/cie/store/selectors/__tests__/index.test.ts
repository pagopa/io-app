import * as pot from "@pagopa/ts-commons/lib/pot";

import * as selectors from "..";
import { AUTH_LEVELS } from "../../../../../common/utils";

describe("CIE selectors", () => {
  const baseState = {
    features: {
      loginFeatures: {
        cieLogin: {
          cieEnv: "preprod",
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

  it("should return correct value for cieEnvSelector", () => {
    expect(selectors.cieEnvSelector(baseState)).toBe("preprod");
  });

  it.each([
    { cieEnv: "production", expected: true },
    { cieEnv: "preprod", expected: false }
  ])(
    "isCieProdSelector should return $expected when cieEnv is $cieEnv",
    ({ cieEnv, expected }) => {
      const state = {
        features: { loginFeatures: { cieLogin: { cieEnv } } }
      } as any;
      expect(selectors.isCieProdSelector(state)).toBe(expected);
    }
  );

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
