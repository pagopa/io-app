import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { AppState } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { OnboardingNotificationsInfoScreenConsent } from "../OnboardingNotificationsInfoScreenConsent";
import * as profileNotificationPermissions from "../../store/actions/profileNotificationPermissions";
import * as notification from "../../utils";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import * as analytics from "../../analytics";

const checkNotificationPermissions = jest.spyOn(
  notification,
  "checkNotificationPermissions"
);

const notificationsInfoScreenConsentSpy = jest.spyOn(
  profileNotificationPermissions,
  "notificationsInfoScreenConsent"
);

const analyticsOpenSettingsSpy = jest
  .spyOn(analytics, "trackNotificationsOptInOpenSettings")
  .mockImplementation(constUndefined);

const openSystemNotificationSettingsScreenSpy = jest
  .spyOn(notification, "openSystemNotificationSettingsScreen")
  .mockImplementation(constUndefined);

describe("OnboardingNotificationsInfoScreenConsent", () => {
  beforeEach(() => {
    checkNotificationPermissions.mockClear();
    notificationsInfoScreenConsentSpy.mockClear();
    analyticsOpenSettingsSpy.mockClear();
    openSystemNotificationSettingsScreenSpy.mockClear();
  });

  it("Click on the button continue check that the NOTIFICATIONS_INFO_SCREEN_CONSENT action is triggered", () => {
    const screen = renderScreen();

    const continueButton = screen.queryByTestId("continue-btn");
    expect(continueButton).not.toBeNull();

    if (continueButton) {
      fireEvent(continueButton, "onPress");
      expect(notificationsInfoScreenConsentSpy).toBeCalled();
    }
  });

  it("Settings button should be there and its tap should call 'trackNotificationsOptInOpenSettings' and 'openSystemNotificationSettingsScreen'", () => {
    const screen = renderScreen();

    const settingsButton = screen.queryByTestId("settings-btn");
    expect(settingsButton).not.toBeUndefined();

    if (settingsButton) {
      fireEvent(settingsButton, "onPress");
      expect(analyticsOpenSettingsSpy).toHaveBeenCalledTimes(1);
      expect(openSystemNotificationSettingsScreenSpy).toHaveBeenCalledTimes(1);
    }
  });

  it("If AppState is active and permissions true trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action", async () => {
    checkNotificationPermissions.mockImplementation(() =>
      Promise.resolve(true)
    );
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const screen = renderScreen();
    expect(screen).not.toBeNull();

    appStateSpy.mock.calls[0][1]("active");

    await waitFor(() => {
      expect(checkNotificationPermissions).toHaveBeenCalledTimes(1);
      expect(notificationsInfoScreenConsentSpy).toBeCalled();
    });
  });

  it("If AppState is active and permissions false doesn't trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action", async () => {
    checkNotificationPermissions.mockImplementation(() =>
      Promise.resolve(false)
    );
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const screen = renderScreen();
    expect(screen).not.toBeNull();

    appStateSpy.mock.calls[0][1]("active");

    await waitFor(() => {
      expect(checkNotificationPermissions).toHaveBeenCalledTimes(1);
      expect(notificationsInfoScreenConsentSpy).not.toBeCalled();
    });
  });

  it("If AppState is not active doesn't trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action", () => {
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const screen = renderScreen();
    expect(screen).not.toBeNull();

    appStateSpy.mock.calls[0][1]("background");
    expect(checkNotificationPermissions).not.toBeCalled();
    expect(notificationsInfoScreenConsentSpy).not.toBeCalled();

    appStateSpy.mock.calls[0][1]("inactive");
    expect(checkNotificationPermissions).not.toBeCalled();
    expect(notificationsInfoScreenConsentSpy).not.toBeCalled();

    appStateSpy.mock.calls[0][1]("unknown");
    expect(checkNotificationPermissions).not.toBeCalled();
    expect(notificationsInfoScreenConsentSpy).not.toBeCalled();

    appStateSpy.mock.calls[0][1]("extension");
    expect(checkNotificationPermissions).not.toBeCalled();
    expect(notificationsInfoScreenConsentSpy).not.toBeCalled();
  });

  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const dsEnabledState = appReducer(
    globalState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, dsEnabledState as any);

  return renderScreenWithNavigationStoreContext(
    OnboardingNotificationsInfoScreenConsent,
    ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT,
    {},
    store
  );
};
