import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { AppState, AppStateStatus } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { OnboardingNotificationsInfoScreenConsent } from "../OnboardingNotificationsInfoScreenConsent";
import * as notification from "../../utils";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import * as analytics from "../../analytics";
import { notificationsInfoScreenConsent } from "../../store/actions/profileNotificationPermissions";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

const checkNotificationPermissions = jest.spyOn(
  notification,
  "checkNotificationPermissions"
);

const analyticsOpenSettingsSpy = jest
  .spyOn(analytics, "trackNotificationsOptInOpenSettings")
  .mockImplementation(constUndefined);

const openSystemNotificationSettingsScreenSpy = jest
  .spyOn(notification, "openSystemNotificationSettingsScreen")
  .mockImplementation(constUndefined);

describe("OnboardingNotificationsInfoScreenConsent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("Click on the button continue check that the NOTIFICATIONS_INFO_SCREEN_CONSENT action is triggered", () => {
    const screen = renderScreen();

    const continueButton = screen.queryByTestId("continue-btn");
    expect(continueButton).not.toBeNull();

    if (continueButton) {
      fireEvent(continueButton, "onPress");
      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);
      expect(mockDispatch.mock.calls[0][0]).toEqual(
        notificationsInfoScreenConsent()
      );
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
      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);
      expect(mockDispatch.mock.calls[0][0]).toEqual(
        notificationsInfoScreenConsent()
      );
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
      expect(mockDispatch.mock.calls.length).toBe(0);
    });
  });

  const appStateStatuses: ReadonlyArray<AppStateStatus> = [
    "background",
    "inactive",
    "unknown",
    "extension"
  ];
  appStateStatuses.forEach(appStateStatus => {
    it(`AppState '${appStateStatus}' does not trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action`, () => {
      const screen = renderScreen(appStateStatus);
      expect(screen).not.toBeNull();

      expect(checkNotificationPermissions).not.toHaveBeenCalled();
      expect(mockDispatch.mock.calls.length).toBe(0);
    });
  });

  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (appStateStatus: AppStateStatus = "active") => {
  const globalState = appReducer(
    undefined,
    applicationChangeState(appStateStatus)
  );
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
