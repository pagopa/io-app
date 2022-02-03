import { Tuple3 } from "@pagopa/ts-commons/lib/tuples";
import DeviceInfo from "react-native-device-info";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { IOVersionInfo } from "../../../types/IOVersionInfo";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../../actions/versionInfo";
import {
  isAppPagoPaSupportedSelector,
  isAppSupportedSelector
} from "../versionInfo";

const mockIoVersionInfo: IOVersionInfo = {
  min_app_version: {
    ios: "0.0.0",
    android: "0.0.0"
  },
  latest_released_app_version: {
    ios: "0.0.0",
    android: "0.0.0"
  },
  rollout_app_version: {
    ios: "0.0.0",
    android: "0.0.0"
  }
};

jest.mock("react-native-device-info", () => ({
  getVersion: jest.fn(),
  getReadableVersion: jest.fn()
}));

// const mockedDeviceInfo = mocked("dev", true);
// const mockedDeviceInfo2 = DeviceInfo.getVersion as jest.MockedFunction<
//   typeof DeviceInfo.getVersion
// >;

describe("versionInfo selectors", () => {
  describe("When the store is in initial state", () => {
    it("isAppSupportedSelector should return true", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.versionInfo).toBeNull();
      expect(isAppSupportedSelector(globalState)).toBe(true);
    });
    it("isAppPagoPaSupportedSelector should return true", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(globalState.versionInfo).toBeNull();
      expect(isAppPagoPaSupportedSelector(globalState)).toBe(true);
    });
  });
  describe("When a versionInfoLoadFailure is received", () => {
    it("isAppSupportedSelector should return true", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(versionInfoLoadFailure(new Error()));
      expect(store.getState().versionInfo).toBeNull();
      expect(isAppSupportedSelector(store.getState())).toBe(true);
    });
    it("isAppPagoPaSupportedSelector should return true", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(versionInfoLoadFailure(new Error()));
      expect(store.getState().versionInfo).toBeNull();
      expect(isAppPagoPaSupportedSelector(store.getState())).toBe(true);
    });
  });
  describe("When a versionInfoLoadSuccess is received", () => {
    describe("And a min_app_version < current app version", () => {
      [
        Tuple3("1.0.0", "6.5.4.3", true),
        Tuple3("1.100.0", "6.5.4.3", true),
        Tuple3("1.100.1000", "6.5.4.3", true),
        Tuple3("1.100.1000.10000", "6.5.4.3", true),
        Tuple3("5.0.0", "6.5.4.3", true),
        Tuple3("6.4.0", "6.5.4.3", true),
        Tuple3("6.5.3", "6.5.4.3", true),
        Tuple3("6.5.4.2", "6.5.4.3", true)
      ].forEach(t =>
        it(`min_app_version: ${t.e1}, appVersion: ${t.e2} should ${
          t.e3 ? "" : "not "
        }be supported`, () => {
          testIsAppSupportedSelector(t.e1, t.e2, t.e3);
        })
      );
    });
  });
});

const testIsAppSupportedSelector = (
  minVersion: string,
  appVersion: string,
  isSupported: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  (DeviceInfo.getVersion as jest.Mock).mockReturnValue(appVersion);
  (DeviceInfo.getReadableVersion as jest.Mock).mockReturnValue(appVersion);
  const store = createStore(appReducer, globalState as any);
  store.dispatch(
    versionInfoLoadSuccess({
      ...mockIoVersionInfo,
      min_app_version: {
        ios: minVersion,
        android: minVersion
      }
    })
  );
  expect(store.getState().versionInfo?.min_app_version).toStrictEqual({
    ios: minVersion,
    android: minVersion
  });
  expect(isAppSupportedSelector(store.getState())).toBe(isSupported);
};
