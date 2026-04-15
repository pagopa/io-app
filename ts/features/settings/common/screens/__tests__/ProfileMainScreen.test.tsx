import { PreloadedState, createStore } from "redux";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import I18n from "i18next";
import { appReducer } from "../../../../../store/reducers";
import ProfileMainScreen from "../ProfileMainScreen";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import { SETTINGS_ROUTES } from "../../navigation/routes";
import { setDebugModeEnabled } from "../../../../../store/actions/debug";

jest.mock("../../../../../utils/environment", () => ({
  ...jest.requireActual("../../../../../utils/environment"),
  isDevEnv: false
}));

jest.spyOn(Alert, "alert");

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as unknown as PreloadedState<ReturnType<typeof appReducer>>
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ProfileMainScreen,
      SETTINGS_ROUTES.SETTINGS_MAIN,
      {},
      store
    ),
    store
  };
};

const mockNavigate = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate
  })
}));

describe(ProfileMainScreen, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it("Should display the alert on logout press", () => {
    const { component } = renderComponent();
    const logoutButton = component.getByTestId(/logoutButton/);

    fireEvent.press(logoutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("profile.logout.alertTitle"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          onPress: expect.any(Function)
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: expect.any(Function)
        }
      ],
      { cancelable: true }
    );
  });

  it("Should navigate to logout screen", () => {
    const { component } = renderComponent();
    const logoutButton = component.getByTestId(/logoutButton/);
    fireEvent.press(logoutButton);

    const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCallArgs[2];

    const exitButton = buttons?.find(
      (b: { text: string }) => b.text === I18n.t("profile.logout.exit")
    );

    expect(exitButton).toBeDefined();

    exitButton?.onPress?.();

    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      { screen: SETTINGS_ROUTES.PROFILE_LOGOUT }
    );
  });

  it("Should navigate to profile information ssection", () => {
    const { component } = renderComponent();
    const changePasswordButton = component.getByTestId("profileDataButton");

    fireEvent.press(changePasswordButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ screen: SETTINGS_ROUTES.PROFILE_DATA })
    );
  });

  it("should show developer section after 5 taps on app version", async () => {
    const { component } = renderComponent();
    const appVersionButton = component.getByTestId("profileAppVersionButton");

    expect(component.queryByText("Sviluppo")).toBeNull();

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < 5; i++) {
      fireEvent.press(appVersionButton);
    }

    await waitFor(() => {
      expect(component.getByTestId("developerModeSection")).toBeTruthy();
    });
  });

  it("should not trigger debug mode if already enabled", () => {
    const { component, store } = renderComponent();

    // debug mode already enabled
    store.dispatch(setDebugModeEnabled(true));

    const appVersionButton = component.getByTestId("profileAppVersionButton");

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < 5; i++) {
      fireEvent.press(appVersionButton);
    }

    // developer mode section should be shown
    expect(component.getByTestId("developerModeSection")).toBeTruthy();
  });

  it("should reset tap counter after timeout", () => {
    const { component } = renderComponent();
    const appVersionButton = component.getByTestId("profileAppVersionButton");

    // first tap
    fireEvent.press(appVersionButton);

    // after 2 seconds, the tap counter should be reset
    jest.advanceTimersByTime(2100);
    jest.runOnlyPendingTimers();

    // tap 4 times but the counter should be reset (not 5)
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < 4; i++) {
      fireEvent.press(appVersionButton);
    }

    // debug mode should not be enabled
    expect(component.queryByTestId("developerModeSection")).toBeNull();
  });

  it("should not show developer section if debug mode is already enabled at mount", () => {
    const { component, store } = renderComponent();

    act(() => {
      store.dispatch(setDebugModeEnabled(true));
    });

    expect(component.getByTestId("developerModeSection")).toBeTruthy();
  });
});
