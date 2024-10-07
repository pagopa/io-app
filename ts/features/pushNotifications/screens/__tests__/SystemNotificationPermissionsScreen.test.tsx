import { fireEvent } from "@testing-library/react-native";
import { constUndefined } from "fp-ts/lib/function";
import React from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as analytics from "../../analytics";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";
import { setEngagementScreenShown } from "../../store/actions/userBehaviour";
import * as utils from "../../utils";
import { SystemNotificationPermissionsScreen } from "../SystemNotificationPermissionsScreen";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack
  })
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("SystemNotificationPermissionsScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  it("Should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("Should call 'trackSystemNotificationPermissionScreenShown' and dispatch 'setEngagementScreenShown' upon rendering", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenShown")
      .mockImplementation(constUndefined);

    renderScreen();

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(0);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(setEngagementScreenShown());
  });
  it("Should have an X close button that should call the analytics tracking and dispatch navigation.back upon pressing", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId("notifications-modal-close-button");
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(1);
    expect(analyticsMock.mock.calls[0][0]).toBe("dismiss");

    expect(settingsSpy.mock.calls.length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have an open-system-notification-settings button that should call the analytics tracking, the utility function and dispatch navigation.back upon pressing", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-open-system-settings-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(1);
    expect(analyticsMock.mock.calls[0][0]).toBe("activate");

    expect(settingsSpy.mock.calls.length).toBe(1);
    expect(settingsSpy.mock.calls[0].length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have a bottom close button that should the analytics tracking and dispatch navigation.back upon pressing", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-not-now-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(1);
    expect(analyticsMock.mock.calls[0][0]).toBe("dismiss");

    expect(settingsSpy.mock.calls.length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <SystemNotificationPermissionsScreen />,
    NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS,
    {},
    store
  );
};

const spyOnOpenSystemNotificationSettings = () =>
  jest
    .spyOn(utils, "openSystemNotificationSettingsScreen")
    .mockImplementation(constUndefined);
