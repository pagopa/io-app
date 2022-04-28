import DeviceInfo from "react-native-device-info";

import { createStore } from "redux";
import { versionInfoLoadSuccess } from "../../../common/versionInfo/store/actions/versionInfo";
import { mockIoVersionInfo } from "../../../common/versionInfo/store/reducers/__mock__/ioVersionInfo";
import { minAppVersionAppVersionTestCases } from "../../../common/versionInfo/store/reducers/__mock__/testVersion";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import WalletHomeScreen from "../WalletHomeScreen";

describe("WalletHomeScreen", () => {
  jest.useFakeTimers();
  minAppVersionAppVersionTestCases.forEach(t => {
    it(`When min_app_version: ${t.e1}, appVersion: ${
      t.e2
    }, WalletHomeScreen should ${
      t.e3 ? "not " : ""
    }render UpdateAppModal`, () => {
      testWalletHomeScreen(t.e1, t.e2, t.e3);
    });
  });
});

const testWalletHomeScreen = (
  minVersion: string,
  appVersion: string,
  isSupported: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  jest.spyOn(DeviceInfo, "getVersion").mockReturnValue(appVersion);
  jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue(appVersion);
  const store = createStore(appReducer, globalState as any);
  store.dispatch(
    versionInfoLoadSuccess({
      ...mockIoVersionInfo,
      min_app_version_pagopa: {
        ios: minVersion,
        android: minVersion
      }
    })
  );
  expect(store.getState().versionInfo?.min_app_version_pagopa).toStrictEqual({
    ios: minVersion,
    android: minVersion
  });

  const testComponent = renderScreenFakeNavRedux<GlobalState>(
    WalletHomeScreen,
    ROUTES.WALLET_HOME,
    {},
    store
  );
  expect(testComponent).not.toBeNull();

  const searchUpdateText = expect(
    testComponent.queryByText(I18n.t("wallet.alert.titlePagoPaUpdateApp"))
  );
  if (isSupported) {
    searchUpdateText.toBeNull();
  } else {
    searchUpdateText.not.toBeNull();
  }
};
