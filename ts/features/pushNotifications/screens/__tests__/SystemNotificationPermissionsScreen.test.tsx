import React from "react";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { constUndefined } from "fp-ts/lib/function";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { SystemNotificationPermissionsScreen } from "../SystemNotificationPermissionsScreen";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";
import * as utils from "../../utils";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack
  })
}));

describe("SystemNotificationPermissionsScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("Should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("Should have an X close button that should dispatch navigation.back upon pressing", () => {
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId("notifications-modal-close-button");
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(settingsSpy.mock.calls.length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have an open-system-notification-settings button that should call the utility function and dispatch navigation.back upon pressing", () => {
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-open-system-settings-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(settingsSpy.mock.calls.length).toBe(1);
    expect(settingsSpy.mock.calls[0].length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have a bottom close button that should dispatch navigation.back upon pressing", () => {
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-not-now-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

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
