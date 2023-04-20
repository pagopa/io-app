import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import DeviceInfo from "react-native-device-info";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import { EmailAddress } from "../../../../definitions/backend/EmailAddress";
import { FiscalCode } from "../../../../definitions/backend/FiscalCode";
import { PaymentAmount } from "../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import { versionInfoLoadSuccess } from "../../../common/versionInfo/store/actions/versionInfo";
import { mockIoVersionInfo } from "../../../common/versionInfo/store/reducers/__mock__/ioVersionInfo";
import { minAppVersionAppVersionTestCases } from "../../../common/versionInfo/store/reducers/__mock__/testVersion";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { profileLoadSuccess } from "../../../store/actions/profile";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { appReducer } from "../../../store/reducers";
import { isProfileEmailValidatedSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import * as PaymentsUtils from "../../../utils/payment";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import PaymentButton from "../MessageDetail/common/PaymentButton";

describe("PaymentButton", () => {
  jest.useFakeTimers();
  minAppVersionAppVersionTestCases.forEach(t => {
    it(`When min_app_version: ${t.e1}, appVersion: ${
      t.e2
    }, and the user tap on PaymentButton, it should ${
      t.e3 ? "" : "not "
    }dispatch paymentInitializeState`, () => {
      testPaymentButton(t.e1, t.e2, t.e3);
    });
  });
});

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

  const testComponent = renderScreenFakeNavRedux<GlobalState>(
    () => (
      <PaymentButton
        amount={1055 as PaymentAmount}
        noticeNumber={"55" as PaymentNoticeNumber}
        organizationFiscalCode={"46545" as OrganizationFiscalCode}
      />
    ),
    ROUTES.MESSAGE_DETAIL_PAGINATED,
    {},
    finalStore
  );

  expect(testComponent).not.toBeNull();

  jest
    .spyOn(PaymentsUtils, "getAmountFromPaymentAmount")
    .mockReturnValue(O.some("132213" as AmountInEuroCents));
  jest
    .spyOn(PaymentsUtils, "getRptIdFromNoticeNumber")
    .mockReturnValue(O.some("132213" as unknown as RptId));

  fireEvent.press(testComponent.getByRole("button"));

  const expected = isSupported ? [paymentInitializeState()] : [];

  expect(finalStore.getActions()).toStrictEqual(expected);
};
