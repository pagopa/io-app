import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Tuple3 } from "@pagopa/ts-commons/lib/tuples";
import { fireEvent } from "@testing-library/react-native";
import { some } from "fp-ts/lib/Option";
import React from "react";
import DeviceInfo from "react-native-device-info";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { FiscalCode } from "../../../../../../definitions/backend/FiscalCode";
import { PaymentAmount } from "../../../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../../../definitions/backend/PaymentNoticeNumber";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import PaymentButton from "../../../../../components/messages/PaymentButton";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { profileLoadSuccess } from "../../../../../store/actions/profile";
import { paymentInitializeState } from "../../../../../store/actions/wallet/payment";
import { appReducer } from "../../../../../store/reducers";
import { isProfileEmailValidatedSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import * as PaymentsUtils from "../../../../../utils/payment";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
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
        expect(isAppPagoPaSupportedSelector(store.getState())).toBe(true);
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
        expect(isAppPagoPaSupportedSelector(store.getState())).toBe(false);

        store.dispatch(versionInfoLoadFailure(new Error()));
        expect(isAppPagoPaSupportedSelector(store.getState())).toBe(true);
      });
    });

    [
      Tuple3("0.0.0", "6.5.4.3", true),
      Tuple3("1.0.0", "6.5.4.3", true),
      Tuple3("1.100.0", "6.5.4.3", true),
      Tuple3("1.100.1000", "6.5.4.3", true),
      Tuple3("1.1.1.10000", "6.5.4.3", true),
      Tuple3("5.0.0", "6.5.4.3", true),
      Tuple3("6.4.0", "6.5.4.3", true),
      Tuple3("6.5.3", "6.5.4.3", true),
      Tuple3("6.5.4.2", "6.5.4.3", true),

      Tuple3("6.5.4.3", "700000.0.0", true),
      Tuple3("6.5.4.3", "7.1.0", true),
      Tuple3("6.5.4.3", "7.1.1", true),
      Tuple3("6.5.4.3", "7.1.1.0", true),
      Tuple3("6.5.4.3", "7.0.0", true),
      Tuple3("6.5.4.3", "6.6.0", true),
      Tuple3("6.5.4.3", "6.5.5", true),
      Tuple3("6.5.4.3", "6.5.4.4", true),

      Tuple3("6.5.4.3", "6.5.4.3", true),

      Tuple3("7.0.0", "6.5.4.3", false),
      Tuple3("7.4.0", "6.5.4.3", false),
      Tuple3("7.5.5", "6.5.4.3", false),
      Tuple3("7.5.4.4", "6.5.4.3", false),
      Tuple3("6.6.0", "6.5.4.3", false),
      Tuple3("6.5.5", "6.5.4.3", false),
      Tuple3("6.5.4.4", "6.5.4.3", false)
    ].forEach(t => {
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
      it(`And min_app_version: ${t.e1}, appVersion: ${
        t.e2
      }, the button should ${t.e3 ? "" : "not "}be supported`, () => {
        testPaymentButton(t.e1, t.e2, t.e3);
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
    expect(isAppPagoPaSupportedSelector(store.getState())).toBe(isSupported);
  }
};

const testPaymentButton = (
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
  store.dispatch(
    profileLoadSuccess({
      is_inbox_enabled: true,
      is_email_enabled: true,
      is_webhook_enabled: true,
      is_email_validated: true,
      family_name: "Red",
      fiscal_code: "FiscalCode" as FiscalCode,
      has_profile: true,
      name: "Tom",
      email: "this@email.it" as EmailAddress,
      service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
      version: 1
    })
  );

  const mockStore = configureMockStore<GlobalState>();
  const finalStore: ReturnType<typeof mockStore> = mockStore({
    ...store.getState()
  } as GlobalState);

  expect(store.getState().versionInfo?.min_app_version_pagopa).toStrictEqual({
    ios: minVersion,
    android: minVersion
  });

  expect(isProfileEmailValidatedSelector(finalStore.getState())).toBe(true);

  const testComponent = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => (
      <PaymentButton
        amount={1055 as PaymentAmount}
        noticeNumber={"55" as PaymentNoticeNumber}
        organizationFiscalCode={"46545" as OrganizationFiscalCode}
      />
    ),
    ROUTES.MESSAGE_DETAIL,
    {},
    finalStore
  );

  expect(testComponent).not.toBeNull();

  jest
    .spyOn(PaymentsUtils, "getAmountFromPaymentAmount")
    .mockReturnValue(some("132213" as AmountInEuroCents));
  jest
    .spyOn(PaymentsUtils, "getRptIdFromNoticeNumber")
    .mockReturnValue(some("132213" as unknown as RptId));

  fireEvent.press(testComponent.getByRole("button"));

  const expected = isSupported ? [paymentInitializeState()] : [];

  expect(finalStore.getActions()).toStrictEqual(expected);
};
