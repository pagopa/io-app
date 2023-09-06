import * as React from "react";
import { render } from "@testing-library/react-native";
import I18n from "../../../../i18n";
import { NotificationPreviewSample } from "../NotificationPreviewSample";

describe("renderNotificationPreviewSample", () => {
  describe("Given enabled previews and enabled reminders", () => {
    it("then title should match 'onboarding.notifications.preview.reminderOnPreviewOnTitle' key and message should match 'onboarding.notifications.preview.reminderOnPreviewOnMessage' key", () => {
      const screen = renderNotificationPreviewSample(true, true);
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
      const screen = renderNotificationPreviewSample(false, true);
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
      const screen = renderNotificationPreviewSample(true, false);
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
      const screen = renderNotificationPreviewSample(false, false);
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

const renderNotificationPreviewSample = (
  previewEnabled: boolean,
  remindersEnabled: boolean
) => {
  const component = (
    <NotificationPreviewSample
      previewEnabled={previewEnabled}
      remindersEnabled={remindersEnabled}
    />
  );
  return render(component);
};
