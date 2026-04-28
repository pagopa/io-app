import * as O from "fp-ts/lib/Option";
import * as appVersion from "../../../../../utils/appVersion";
import {
  fciSecurityLevelCheckHelpCenterUrlSelector,
  isFciSecurityLevelCheckEnabledSelector
} from "../remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types.ts";

const noneState = { remoteConfig: O.none } as GlobalState;

const makeState = (fci: object): GlobalState =>
  ({ remoteConfig: O.some({ fci }) }) as GlobalState;

const mockAppVersion = (v: string) =>
  jest.spyOn(appVersion, "getAppVersion").mockReturnValue(v);

describe("isFciSecurityLevelCheckEnabledSelector", () => {
  afterEach(() => jest.restoreAllMocks());

  it("returns false when remoteConfig is none", () => {
    expect(isFciSecurityLevelCheckEnabledSelector(noneState)).toBe(false);
  });

  it("returns false when fci min_app_version is not satisfied", () => {
    mockAppVersion("1.0.0.0");
    expect(
      isFciSecurityLevelCheckEnabledSelector(
        makeState({
          min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
          security_level_check: {
            min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
          }
        })
      )
    ).toBe(false);
  });

  it("returns false when security_level_check min_app_version is not satisfied", () => {
    mockAppVersion("1.0.0.0");
    expect(
      isFciSecurityLevelCheckEnabledSelector(
        makeState({
          min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
          security_level_check: {
            min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
          }
        })
      )
    ).toBe(false);
  });

  it("returns false when security_level_check is absent", () => {
    mockAppVersion("2.0.0.0");
    expect(
      isFciSecurityLevelCheckEnabledSelector(
        makeState({ min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" } })
      )
    ).toBe(false);
  });

  it("returns true when both min_app_version gates are satisfied", () => {
    mockAppVersion("3.0.0.0");
    expect(
      isFciSecurityLevelCheckEnabledSelector(
        makeState({
          min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
          security_level_check: {
            min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
          }
        })
      )
    ).toBe(true);
  });

  it("returns true when both min_app_version gates are satisfied (Security Level min version Equals App version)", () => {
    mockAppVersion("2.0.0.0");
    expect(
      isFciSecurityLevelCheckEnabledSelector(
        makeState({
          min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
          security_level_check: {
            min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
          }
        })
      )
    ).toBe(true);
  });
});

describe("fciSecurityLevelCheckHelpCenterUrlSelector", () => {
  it("returns undefined when remoteConfig is none", () => {
    expect(
      fciSecurityLevelCheckHelpCenterUrlSelector(noneState)
    ).toBeUndefined();
  });

  it("returns undefined when helpCenter_url is absent", () => {
    expect(
      fciSecurityLevelCheckHelpCenterUrlSelector(
        makeState({ min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" } })
      )
    ).toBeUndefined();
  });

  it("returns the helpCenter_url when present", () => {
    const url = "https://help.example.com/fci-security";
    expect(
      fciSecurityLevelCheckHelpCenterUrlSelector(
        makeState({
          min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
          security_level_check: { helpCenter_url: url }
        })
      )
    ).toBe(url);
  });
});
