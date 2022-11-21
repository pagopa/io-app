import * as React from "react";
import { render } from "@testing-library/react-native";
import I18n from "../../../../../ts/i18n";
import { NotificationsPreferencesPreview } from "../NotificationsPreferencesPreview";

describe("OnboardingNotificationsPreferencesScreen", () => {
  describe("Given enabled previews and enabled reminders", () => {
    it("then title should match 'onboarding.notifications.preview.reminderOnPreviewOnTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOnMessage' key", () => {
      const screen = renderNotificationsPreferencesPreview(true, true, false);
      expect(screen).not.toBeNull();

      const h4Title = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOnPreviewOnTitle")
      );
      expect(h4Title).not.toBeNull();

      const h5Message = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOnPreviewOnMessage")
      );
      expect(h5Message).not.toBeNull();
    });
  });
  describe("Given disabled previews and enabled reminders", () => {
    it("then title should match 'onboarding.notifications.preview.reminderOnPreviewOffTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOffMessage' key", () => {
      const screen = renderNotificationsPreferencesPreview(false, true, false);
      expect(screen).not.toBeNull();

      const h4Title = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOnPreviewOffTitle")
      );
      expect(h4Title).not.toBeNull();

      const h5Message = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOnPreviewOffMessage")
      );
      expect(h5Message).not.toBeNull();
    });
  });
  describe("Given enabled previews and disabled reminders", () => {
    it("then title should match 'onboarding.notifications.preview.reminderOffPreviewOnTitle' key and message should match 'onboarding.notifications.preview.reminderOffPreviewOnMessage' key", () => {
      const screen = renderNotificationsPreferencesPreview(true, false, false);
      expect(screen).not.toBeNull();

      const h4Title = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOffPreviewOnTitle")
      );
      expect(h4Title).not.toBeNull();

      const h5Message = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOffPreviewOnMessage")
      );
      expect(h5Message).not.toBeNull();
    });
  });
  describe("Given disabled previews and disabled reminders", () => {
    it("then title should match 'onboarding.notifications.preview.reminderOffPreviewOffTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOffMessage' key", () => {
      const screen = renderNotificationsPreferencesPreview(false, false, false);
      expect(screen).not.toBeNull();

      const h4Title = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOffPreviewOffTitle")
      );
      expect(h4Title).not.toBeNull();

      const h5Message = screen.queryByText(
        I18n.t("onboarding.notifications.preview.reminderOffPreviewOffMessage")
      );
      expect(h5Message).not.toBeNull();
    });
  });
});

const renderNotificationsPreferencesPreview = (
  previewEnabled: boolean,
  remindersEnabled: boolean,
  isFirstOnboarding: boolean
) => {
  const component = (
    <NotificationsPreferencesPreview
      previewEnabled={previewEnabled}
      remindersEnabled={remindersEnabled}
      isFirstOnboarding={isFirstOnboarding}
    />
  );
  return render(component);
};
