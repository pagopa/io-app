import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createStore } from "redux";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/ReminderStatus";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { NotificationsPreferencesScreen } from "../NotificationsPreferencesScreen";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

describe("NotificationsPreferencesScreen", () => {
  it("given an undefined 'reminder_status' then the switch should be off", () => {
    const screen = renderScreen();
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("remindersPreferenceSwitch");
    expect(toggle.props.value).toBeFalsy();
  });

  it("given an ENABLED 'reminder_status'then the switch should be on", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.ENABLED);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("remindersPreferenceSwitch");
    expect(toggle.props.value).toBeTruthy();
  });

  it("given a DISABLED 'reminder_status' then the switch should be off", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.DISABLED);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("remindersPreferenceSwitch");
    expect(toggle.props.value).toBeFalsy();
  });

  it("given an undefined 'push_notifications_content_type' then the switch should be off", () => {
    const screen = renderScreen();
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("previewsPreferenceSwitch");
    expect(toggle.props.value).toBeFalsy();
  });

  it("given a FULL 'push_notifications_content_type' then the switch should be on", () => {
    const screen = renderScreen(PushNotificationsContentTypeEnum.FULL);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("previewsPreferenceSwitch");
    expect(toggle.props.value).toBeTruthy();
  });

  it("given an ANONYMOUS 'push_notifications_content_type' then the switch should be off", () => {
    const screen = renderScreen(PushNotificationsContentTypeEnum.ANONYMOUS);
    expect(screen).not.toBeNull();

    const toggle = screen.getByTestId("previewsPreferenceSwitch");
    expect(toggle.props.value).toBeFalsy();
  });

  it("should match snapshot, undefined preview, undefined reminder, not updating", () => {
    const screen = renderScreen(undefined, undefined, false);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, undefined preview, undefined reminder,     updating", () => {
    const screen = renderScreen(undefined, undefined, true);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, undefined preview, disabled  reminder, not updating", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.DISABLED, false);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, undefined preview, disabled  reminder,     updating", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.DISABLED, true);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, undefined preview, enabled   reminder, not updating", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.ENABLED, false);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, undefined preview, enabled   reminder,     updating", () => {
    const screen = renderScreen(undefined, ReminderStatusEnum.ENABLED, true);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, undefined reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      undefined,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, undefined reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      undefined,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, disabled  reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      ReminderStatusEnum.DISABLED,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, disabled  reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      ReminderStatusEnum.DISABLED,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, enabled   reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      ReminderStatusEnum.ENABLED,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, disabled  preview, enabled   reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.ANONYMOUS,
      ReminderStatusEnum.ENABLED,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, undefined reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      undefined,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, undefined reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      undefined,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, disabled  reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      ReminderStatusEnum.DISABLED,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, disabled  reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      ReminderStatusEnum.DISABLED,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, enabled   reminder, not updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      ReminderStatusEnum.ENABLED,
      false
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, enabled   preview, enabled   reminder,     updating", () => {
    const screen = renderScreen(
      PushNotificationsContentTypeEnum.FULL,
      ReminderStatusEnum.ENABLED,
      true
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  previewValue?: PushNotificationsContentTypeEnum,
  reminderValue?: ReminderStatusEnum,
  isUpdatingProfile: boolean = false
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const profile = {
    push_notifications_content_type: previewValue,
    reminder_status: reminderValue
  } as InitializedProfile;
  const finalState = {
    ...globalState,
    profile: isUpdatingProfile ? pot.noneUpdating(profile) : pot.some(profile)
  } as GlobalState;
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    NotificationsPreferencesScreen,
    SETTINGS_ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS,
    {},
    store
  );
};
