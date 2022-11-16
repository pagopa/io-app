import configureMockStore from "redux-mock-store";
import { AppState } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import OnboardingNotificationsInfoScreenConsent from "../OnboardingNotificationsInfoScreenConsent";
import * as notificationsActions from "../../../store/actions/notifications";
import * as notification from "../../../utils/notification";

const checkNotificationPermissions = jest.spyOn(
  notification,
  "checkNotificationPermissions"
);

const notificationsInfoScreenConsentSpy = jest.spyOn(
  notificationsActions,
  "notificationsInfoScreenConsent"
);

describe("OnboardingNotificationsInfoScreenConsent", () => {
  beforeEach(() => {
    checkNotificationPermissions.mockClear();
    notificationsInfoScreenConsentSpy.mockClear();
  });

  it("Click on the button continue check that the NOTIFICATIONS_INFO_SCREEN_CONSENT action is triggered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component } = renderComponentMockStore(globalState);

    const continueButton = component.queryByTestId("continue-btn");
    expect(continueButton).not.toBeNull();

    if (continueButton) {
      fireEvent(continueButton, "onPress");
      expect(notificationsInfoScreenConsentSpy).toBeCalled();
    }
  });

  it("If AppState is active and permissions true trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action", async () => {
    checkNotificationPermissions.mockImplementation(() =>
      Promise.resolve(true)
    );
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const { component } = renderComponentMockStore(globalState);
    expect(component).not.toBeNull();

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
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const { component } = renderComponentMockStore(globalState);
    expect(component).not.toBeNull();

    appStateSpy.mock.calls[0][1]("active");

    await waitFor(() => {
      expect(checkNotificationPermissions).toHaveBeenCalledTimes(1);
      expect(notificationsInfoScreenConsentSpy).not.toBeCalled();
    });
  });

  it("If AppState is not active doesn't trigger NOTIFICATIONS_INFO_SCREEN_CONSENT action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const appStateSpy = jest.spyOn(AppState, "addEventListener");

    const { component } = renderComponentMockStore(globalState);
    expect(component).not.toBeNull();

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
});

const renderComponentMockStore = (state: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext(
      OnboardingNotificationsInfoScreenConsent,
      ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT,
      {},
      store
    ),
    store
  };
};
