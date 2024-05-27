/* eslint-disable no-bitwise */
import React from "react";
import { createStore } from "redux";
import { ProfileNotificationSettings } from "../ProfileNotificationsSettings";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";

describe("ProfileNotificationSettings", () => {
  [...Array(128).keys()].forEach(index => {
    const previewSwitchDisabled = !!(index & 0b00000001);
    const previewSwitchIsUpdating = !!(index & 0b00000010);
    const previewSwitchValue = !!(index & 0b00000100);
    const reminderSwitchDisabled = !!(index & 0b00001000);
    const reminderSwitchIsUpdating = !!(index & 0b00010000);
    const reminderSwitchValue = !!(index & 0b00100000);
    const showSettingsPath = !!(index & 0b01000000);
    it(`should match snapshot, preview ${
      previewSwitchDisabled ? "disabled" : "enabled "
    }, preview ${
      previewSwitchIsUpdating ? "updating    " : "not updating"
    }, preview ${previewSwitchValue ? "on " : "off"}, reminder ${
      reminderSwitchDisabled ? "disabled" : "enabled "
    }, reminder ${
      reminderSwitchIsUpdating ? "updating    " : "not updating"
    }, reminder ${reminderSwitchValue ? "on " : "off"}, settings path ${
      showSettingsPath ? "shown" : "hidden"
    }`, () => {
      const component = renderComponent(
        previewSwitchDisabled,
        previewSwitchIsUpdating,
        previewSwitchValue,
        reminderSwitchDisabled,
        reminderSwitchIsUpdating,
        reminderSwitchValue,
        showSettingsPath
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
});

const renderComponent = (
  previewSwitchDisabled: boolean,
  previewSwitchIsUpdating: boolean,
  previewSwitchValue: boolean,
  reminderSwitchDisabled: boolean,
  reminderSwitchIsUpdating: boolean,
  reminderSwitchValue: boolean,
  showSettingsPath: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const dsEnabledState = appReducer(
    globalState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, dsEnabledState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ProfileNotificationSettings
        previewSwitchValue={previewSwitchValue}
        remindersSwitchValue={reminderSwitchValue}
        disablePreviewSetting={previewSwitchDisabled}
        disableRemindersSetting={reminderSwitchDisabled}
        isUpdatingPreviewSetting={previewSwitchIsUpdating}
        isUpdatingRemindersSetting={reminderSwitchIsUpdating}
        showSettingsPath={showSettingsPath}
      />
    ),
    ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS,
    {},
    store
  );
};
