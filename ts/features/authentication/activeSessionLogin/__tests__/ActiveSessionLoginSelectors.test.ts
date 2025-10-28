import * as O from "fp-ts/lib/Option";
import {
  isActiveSessionLoginRemotelyEnabledSelector,
  isActiveSessionLoginEnabledSelector,
  isActiveSessionLoginLocallyEnabledSelector
} from "../store/selectors";
import { GlobalState } from "../../../../store/reducers/types";

// Mock DeviceInfo for version checks
jest.mock("react-native-device-info", () => ({
  getVersion: jest.fn(() => "3.2.1.0"),
  getReadableVersion: jest.fn(() => "3.2.1.0")
}));

describe("isActiveSessionLoginRemotelyEnabledSelector", () => {
  const getState = (loginConfig: object | undefined) =>
    ({
      remoteConfig: O.some({
        loginConfig
      })
    } as unknown as GlobalState);

  it("should return true if activeSessionLogin is enabled and min_app_version is == current version", () => {
    const state = getState({
      activeSessionLogin: {
        min_app_version: { ios: "3.2.1.0", android: "3.2.1.0" }
      }
    });
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(true);
  });

  it("should return true if activeSessionLogin is enabled and min_app_version is < current version", () => {
    const state = getState({
      activeSessionLogin: {
        min_app_version: { ios: "2.9.1.0", android: "2.9.1.0" }
      }
    });
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(true);
  });

  it("should return false if activeSessionLogin is enabled and min_app_version is > current version", () => {
    const state = getState({
      activeSessionLogin: {
        min_app_version: { ios: "3.2.1.1", android: "3.2.1.1" }
      }
    });
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
  });

  it("should return false if activeSessionLogin is undefined", () => {
    const state = getState({});
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
  });

  it("should return false if loginConfig is undefined", () => {
    const state = getState(undefined);
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
  });

  it("should return false if remoteConfig is none", () => {
    const state = { remoteConfig: O.none } as unknown as GlobalState;
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
  });
});

describe("isActiveSessionLoginEnabledSelector (local and remote flags)", () => {
  const getState = (
    loginConfig: object | undefined,
    localFlag: boolean | undefined = true
  ) =>
    ({
      remoteConfig: O.some({
        loginConfig
      }),
      features: {
        loginFeatures: {
          activeSessionLogin: {
            activeSessionLoginLocalFlag: localFlag
          }
        }
      }
    } as unknown as GlobalState);

  it("should return true if both remote and local flag are true", () => {
    const state = getState(
      {
        activeSessionLogin: {
          min_app_version: { ios: "3.2.1.0", android: "3.2.1.0" }
        }
      },
      true
    );
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(true);
    expect(isActiveSessionLoginLocallyEnabledSelector(state)).toBe(true);
    expect(isActiveSessionLoginEnabledSelector(state)).toBe(true);
  });

  it("should return true if remote flag is true but local flag is false", () => {
    const state = getState(
      {
        activeSessionLogin: {
          min_app_version: { ios: "3.2.1.0", android: "3.2.1.0" }
        }
      },
      false
    );
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(true);
    expect(isActiveSessionLoginLocallyEnabledSelector(state)).toBe(false);
    expect(isActiveSessionLoginEnabledSelector(state)).toBe(true);
  });

  it("should return true if remote flag is false but local flag is true", () => {
    const state = getState(
      {
        activeSessionLogin: {
          min_app_version: { ios: "3.2.1.1", android: "3.2.1.1" }
        }
      },
      true
    );
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
    expect(isActiveSessionLoginLocallyEnabledSelector(state)).toBe(true);
    expect(isActiveSessionLoginEnabledSelector(state)).toBe(true);
  });

  it("should return false if both remote and local flag are false", () => {
    const state = getState(
      {
        activeSessionLogin: {
          min_app_version: { ios: "3.2.1.1", android: "3.2.1.1" }
        }
      },
      false
    );
    expect(isActiveSessionLoginRemotelyEnabledSelector(state)).toBe(false);
    expect(isActiveSessionLoginLocallyEnabledSelector(state)).toBe(false);
    expect(isActiveSessionLoginEnabledSelector(state)).toBe(false);
  });
});
