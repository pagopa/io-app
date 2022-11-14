import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../ts/i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";

import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import mockedProfile from "../../../__mocks__/initializedProfile";
import OnboardingNotificationsPreferencesScreen from "../OnboardingNotificationsPreferencesScreen";

describe("OnboardingNotificationsPreferencesScreen", () => {
  describe("given an onboarded user", () => {
    it("then the title should match the 'profile.preferences.notifications.titleExistingUser' key and the subtitle should match 'profile.preferences.notifications.subtitleExistingUser'", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore(globalState, false);
      expect(screen).not.toBeNull();

      const headerH1Title = screen.component.queryByText(
        I18n.t("profile.preferences.notifications.titleExistingUser")
      );
      expect(headerH1Title).not.toBeNull();

      const bodySubtitle = screen.component.queryByText(
        I18n.t("profile.preferences.notifications.subtitleExistingUser")
      );
      expect(bodySubtitle).not.toBeNull();
    });
  });

  describe("given an user that is doing the onboarding for the first time", () => {
    it("then the title should match the 'profile.preferences.notifications.title' key and the subtitle should match 'profile.preferences.notifications.subtitle'", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore(globalState, true);
      expect(screen).not.toBeNull();

      const headerH1Title = screen.component.queryByText(
        I18n.t("profile.preferences.notifications.title")
      );
      expect(headerH1Title).not.toBeNull();

      const bodySubtitle = screen.component.queryByText(
        I18n.t("profile.preferences.notifications.subtitle")
      );
      expect(bodySubtitle).not.toBeNull();
    });
  });

  describe("given an onboarded user and an undefined 'reminder_status'", () => {
    it("then the reminders switch should be on", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore(
        {
          ...globalState,
          profile: pot.some({
            ..._.omit(mockedProfile, "reminder_status")
          })
        },
        false
      );
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("remindersPreferenceSwitch");
      expect(toggle.props.value).toBeTruthy();
    });
  });

  describe("given an onboarded user and an undefined 'push_notifications_content_type'", () => {
    it("then the previews switch should be on", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore(
        {
          ...globalState,
          profile: pot.some({
            ..._.omit(mockedProfile, "push_notifications_content_type")
          })
        },
        false
      );
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("previewsPreferenceSwitch");
      expect(toggle.props.value).toBeTruthy();
    });
  });
});

const renderComponentMockStore = (
  state: GlobalState,
  isFirstOnboarding: boolean
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext(
      OnboardingNotificationsPreferencesScreen,
      ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
      {
        isFirstOnboarding
      },
      store
    ),
    store
  };
};
