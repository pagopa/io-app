import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { OnboardingNotificationsPreferencesScreen } from "../OnboardingNotificationsPreferencesScreen";
import { GlobalState } from "../../../../store/reducers/types";

describe("OnboardingNotificationsPreferencesScreen", () => {
  it("given an user that is doing the onboarding for the first time then the title should match the 'profile.preferences.notifications.title' key and the subtitle should match 'profile.preferences.notifications.subtitle'", () => {
    const screen = renderScreen(true);
    expect(screen).not.toBeNull();

    const headerH1Title = screen.queryByText(
      I18n.t("profile.preferences.notifications.title")
    );
    expect(headerH1Title).not.toBeNull();

    const bodySubtitle = screen.queryByText(
      I18n.t("profile.preferences.notifications.subtitle")
    );
    expect(bodySubtitle).not.toBeNull();
  });

  it("given an onboarded user and an undefined 'reminder_status' then the reminders switch should be on", () => {
    const screen = renderScreen(false);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("remindersPreferenceSwitch");
    expect(toggle.props.value).toBeTruthy();
  });

  it("given an onboarded user and an undefined 'push_notifications_content_type' then the previews switch should be on", () => {
    const screen = renderScreen(false);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("previewsPreferenceSwitch");
    expect(toggle.props.value).toBeTruthy();
  });

  it("should match snapshot when updating the profile", () => {
    const screen = renderScreen(true, true);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not updating the profile", () => {
    const screen = renderScreen(false);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not updating the profile, disabled previews switch", () => {
    const screen = renderScreen(false);

    const previewSwitch = screen.getByTestId("previewsPreferenceSwitch");
    act(() => {
      fireEvent(previewSwitch, "onValueChange", false);
    });

    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not updating the profile, disabled reminder switch", () => {
    const screen = renderScreen(false);

    const reminderSwitch = screen.getByTestId("remindersPreferenceSwitch");
    act(() => {
      fireEvent(reminderSwitch, "onValueChange", false);
    });

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when not updating the profile, disabled previews and reminder switches", () => {
    const screen = renderScreen(false);

    const previewSwitch = screen.getByTestId("previewsPreferenceSwitch");

    const reminderSwitch = screen.getByTestId("remindersPreferenceSwitch");
    act(() => {
      fireEvent(previewSwitch, "onValueChange", false);
      fireEvent(reminderSwitch, "onValueChange", false);
    });

    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  isFirstOnboarding: boolean,
  isUpdatingProfile: boolean = false
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = {
    ...globalState,
    profile: isUpdatingProfile ? pot.noneUpdating({}) : pot.some({})
  } as GlobalState;
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    OnboardingNotificationsPreferencesScreen,
    ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
    {
      isFirstOnboarding
    },
    store
  );
};
