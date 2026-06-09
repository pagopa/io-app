import DeviceInfo from "react-native-device-info";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { IOVersionInfo } from "../../../types/IOVersionInfo";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../../actions/versionInfo";
import { mockIoVersionInfo } from "../__mock__/ioVersionInfo";
import { minAppVersionAppVersionTestCases } from "../__mock__/testVersion";
import {
  isPagoPaSupportedSelector,
  isAppSupportedSelector
} from "../versionInfo";

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
      expect(isPagoPaSupportedSelector(globalState)).toBe(true);
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
      expect(isPagoPaSupportedSelector(store.getState())).toBe(true);
    });
  });
  describe("When a versionInfoLoadSuccess is received", () => {
    describe("And the payload doesn't have min_app_version_pagopa", () => {
      it("isAppPagoPaSupportedSelector should return true", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("2.0.0.1");
        jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("2.0.0.1");
        const store = createStore(appReducer, globalState as any);
        store.dispatch(versionInfoLoadSuccess(mockIoVersionInfo));
        expect(
          store.getState().versionInfo?.min_app_version_pagopa
        ).toBeUndefined();
        expect(isPagoPaSupportedSelector(store.getState())).toBe(true);
      });
    });

    describe("Followed by a versionInfoLoadFailure is received", () => {
      it("isAppSupportedSelector should return true", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("2.0.0.1");
        jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("2.0.0.1");
        const store = createStore(appReducer, globalState as any);
        store.dispatch(
          versionInfoLoadSuccess({
            ...mockIoVersionInfo,
            min_app_version: {
              ios: "2.2.0.1",
              android: "2.2.0.1"
            }
          })
        );
        expect(store.getState().versionInfo?.min_app_version).toStrictEqual({
          ios: "2.2.0.1",
          android: "2.2.0.1"
        });
        expect(isAppSupportedSelector(store.getState())).toBe(false);

        store.dispatch(versionInfoLoadFailure(new Error()));
        expect(isAppSupportedSelector(store.getState())).toBe(true);
      });
      it("isAppPagoPaSupportedSelector should return true", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("2.0.0.1");
        jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("2.0.0.1");
        const store = createStore(appReducer, globalState as any);
        store.dispatch(
          versionInfoLoadSuccess({
            ...mockIoVersionInfo,
            min_app_version_pagopa: {
              ios: "2.2.0.1",
              android: "2.2.0.1"
            }
          })
        );
        expect(
          store.getState().versionInfo?.min_app_version_pagopa
        ).toStrictEqual({
          ios: "2.2.0.1",
          android: "2.2.0.1"
        });
        expect(isPagoPaSupportedSelector(store.getState())).toBe(false);

        store.dispatch(versionInfoLoadFailure(new Error()));
        expect(isPagoPaSupportedSelector(store.getState())).toBe(true);
      });
    });

    minAppVersionAppVersionTestCases.forEach(t => {
      it(`And min_app_version: ${t.e1}, appVersion: ${
        t.e2
      }, the app version should ${t.e3 ? "" : "not "}be supported`, () => {
        testIsAppSupportedSelector(t.e1, t.e2, t.e3, "min_app_version");
      });
      it(`And min_app_version: ${t.e1}, appVersion: ${
        t.e2
      }, the pagopa app version should ${
        t.e3 ? "" : "not "
      }be supported`, () => {
        testIsAppSupportedSelector(t.e1, t.e2, t.e3, "min_app_version_pagopa");
      });
    });
  });
});

const testIsAppSupportedSelector = (
  minVersion: string,
  appVersion: string,
  isSupported: boolean,
  key: Extract<
    keyof IOVersionInfo,
    "min_app_version" | "min_app_version_pagopa"
  >
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  jest.spyOn(DeviceInfo, "getVersion").mockReturnValue(appVersion);
  jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue(appVersion);
  const store = createStore(appReducer, globalState as any);
  store.dispatch(
    versionInfoLoadSuccess({
      ...mockIoVersionInfo,
      [key]: {
        ios: minVersion,
        android: minVersion
      }
    })
  );
  expect(store.getState().versionInfo?.[key]).toStrictEqual({
    ios: minVersion,
    android: minVersion
  });
  if (key === "min_app_version") {
    expect(isAppSupportedSelector(store.getState())).toBe(isSupported);
  } else {
    expect(isPagoPaSupportedSelector(store.getState())).toBe(isSupported);
  }
};
