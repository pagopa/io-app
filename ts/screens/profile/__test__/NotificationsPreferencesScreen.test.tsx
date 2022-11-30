import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";

import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import mockedProfile from "../../../__mocks__/initializedProfile";
import { NotificationsPreferencesScreen } from "../NotificationsPreferencesScreen";

describe("NotificationsPreferencesScreen", () => {
  describe("given an undefined 'reminder_status'", () => {
    it("then the switch should be off", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ..._.omit(mockedProfile, "reminder_status")
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("remindersPreferenceSwitch");
      expect(toggle.props.value).toBeFalsy();
    });
  });

  describe("given an ENABLED 'reminder_status'", () => {
    it("then the switch should be on", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ...mockedProfile,
          reminder_status: ReminderStatusEnum.ENABLED
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("remindersPreferenceSwitch");
      expect(toggle.props.value).toBeTruthy();
    });
  });

  describe("given a DISABLED 'reminder_status'", () => {
    it("then the switch should be off", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ...mockedProfile,
          reminder_status: ReminderStatusEnum.DISABLED
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("remindersPreferenceSwitch");
      expect(toggle.props.value).toBeFalsy();
    });
  });

  describe("given an undefined 'push_notifications_content_type'", () => {
    it("then the switch should be off", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ..._.omit(mockedProfile, "push_notifications_content_type")
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("previewPreferenceSwitch");
      expect(toggle.props.value).toBeFalsy();
    });
  });

  describe("given a FULL 'push_notifications_content_type'", () => {
    it("then the switch should be on", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ...mockedProfile,
          push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("previewPreferenceSwitch");
      expect(toggle.props.value).toBeTruthy();
    });
  });

  describe("given an ANONYMOUS 'push_notifications_content_type'", () => {
    it("then the switch should be off", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const screen = renderComponentMockStore({
        ...globalState,
        profile: pot.some({
          ...mockedProfile,
          push_notifications_content_type:
            PushNotificationsContentTypeEnum.ANONYMOUS
        })
      });
      expect(screen).not.toBeNull();

      const toggle = screen.component.getByTestId("previewPreferenceSwitch");
      expect(toggle.props.value).toBeFalsy();
    });
  });
});

const renderComponentMockStore = (state: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext(
      NotificationsPreferencesScreen,
      ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS,
      {},
      store
    ),
    store
  };
};
