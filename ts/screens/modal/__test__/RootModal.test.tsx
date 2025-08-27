import DeviceInfo from "react-native-device-info";

import { createStore } from "redux";
import { act } from "@testing-library/react-native";
import I18n from "i18next";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../../../common/versionInfo/store/actions/versionInfo";
import { mockIoVersionInfo } from "../../../common/versionInfo/store/reducers/__mock__/ioVersionInfo";
import { minAppVersionAppVersionTestCases } from "../../../common/versionInfo/store/reducers/__mock__/testVersion";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import RootModal from "../RootModal";

describe("RootModal", () => {
  describe("When the store is in initial state", () => {
    it("Shouldn't render the UpdateAppModal", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("5.0.4.2");
      jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("5.0.4.2");
      const store = createStore(appReducer, globalState as any);
      expect(store.getState().versionInfo).toStrictEqual(null);

      const testComponent = renderScreenWithNavigationStoreContext<GlobalState>(
        RootModal,
        ROUTES.INGRESS,
        {},
        store
      );
      expect(testComponent).not.toBeNull();

      expect(testComponent.queryByText(I18n.t("titleUpdateApp"))).toBeNull();
    });
  });
  describe("When a versionInfoLoadFailure is dispatched", () => {
    it("Shouldn't render the UpdateAppModal", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("5.0.4.2");
      jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("5.0.4.2");
      const store = createStore(appReducer, globalState as any);
      expect(store.getState().versionInfo).toStrictEqual(null);
      act(() => {
        store.dispatch(versionInfoLoadFailure(new Error()));
      });

      const testComponent = renderScreenWithNavigationStoreContext<GlobalState>(
        RootModal,
        ROUTES.INGRESS,
        {},
        store
      );
      expect(testComponent).not.toBeNull();

      expect(testComponent.queryByText(I18n.t("titleUpdateApp"))).toBeNull();
    });
    describe("And a success is received after retry with min_app_version > current_app_version", () => {
      it("Should render the UpdateAppModal after the success", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("5.0.4.2");
        jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("5.0.4.2");
        const store = createStore(appReducer, globalState as any);
        expect(store.getState().versionInfo).toStrictEqual(null);
        act(() => {
          store.dispatch(versionInfoLoadFailure(new Error()));
        });

        const testComponent =
          renderScreenWithNavigationStoreContext<GlobalState>(
            RootModal,
            ROUTES.INGRESS,
            {},
            store
          );
        expect(testComponent).not.toBeNull();

        expect(testComponent.queryByText(I18n.t("titleUpdateApp"))).toBeNull();

        act(() => {
          store.dispatch(
            versionInfoLoadSuccess({
              ...mockIoVersionInfo,
              min_app_version: {
                ios: "6.0.0.0",
                android: "6.0.0.0"
              }
            })
          );
        });

        expect(
          testComponent.queryByText(I18n.t("titleUpdateApp"))
        ).not.toBeNull();
      });
    });
  });
  jest.useFakeTimers();
  minAppVersionAppVersionTestCases.forEach(t => {
    it(`When min_app_version: ${t.e1}, appVersion: ${t.e2}, RootModal should ${
      t.e3 ? "not " : ""
    }render UpdateAppModal`, () => {
      testRootModal(t.e1, t.e2, t.e3);
    });
  });
});

const testRootModal = (
  minVersion: string,
  appVersion: string,
  isSupported: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  jest.spyOn(DeviceInfo, "getVersion").mockReturnValue(appVersion);
  jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue(appVersion);
  const store = createStore(appReducer, globalState as any);
  act(() => {
    store.dispatch(
      versionInfoLoadSuccess({
        ...mockIoVersionInfo,
        min_app_version: {
          ios: minVersion,
          android: minVersion
        }
      })
    );
  });
  expect(store.getState().versionInfo?.min_app_version).toStrictEqual({
    ios: minVersion,
    android: minVersion
  });

  const testComponent = renderScreenWithNavigationStoreContext<GlobalState>(
    RootModal,
    ROUTES.INGRESS,
    {},
    store
  );
  expect(testComponent).not.toBeNull();

  // eslint-disable-next-line jest/valid-expect
  const searchUpdateText = expect(
    testComponent.queryByText(I18n.t("titleUpdateApp"))
  );
  if (isSupported) {
    searchUpdateText.toBeNull();
  } else {
    searchUpdateText.not.toBeNull();
  }
};
