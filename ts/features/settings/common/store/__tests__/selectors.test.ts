import * as pot from "@pagopa/ts-commons/lib/pot";
import mockedProfile from "../../../../../__mocks__/initializedProfile";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  profileNameSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector,
  hasProfileEmailSelector,
  profileServicePreferencesModeSelector,
  isProfileEmailAlreadyTakenSelector,
  isProfileFirstOnBoardingSelector,
  profileNotificationSettingsSelector,
  tosVersionSelector
} from "../selectors";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { ReminderStatusEnum } from "../../../../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../../../../definitions/backend/PushNotificationsContentType";

describe("profile selectors", () => {
  const baseProfile = {
    ...mockedProfile,
    is_email_enabled: true,
    is_inbox_enabled: true,
    name: "john",
    family_name: "doe",
    fiscal_code: "RSSMRA85M01H501Z",
    service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
    is_email_already_taken: false,
    reminder_status: ReminderStatusEnum.ENABLED,
    push_notifications_content_type: PushNotificationsContentTypeEnum.FULL,
    accepted_tos_version: 3
  };

  const globalState: GlobalState = {
    // @ts-expect-error partial state for testing
    profile: pot.some(baseProfile)
  };

  it("should select isEmailEnabledSelector", () => {
    expect(isEmailEnabledSelector(globalState)).toBe(true);
  });

  it("should select isInboxEnabledSelector", () => {
    expect(isInboxEnabledSelector(globalState)).toBe(true);
  });

  it("should select profileNameSelector", () => {
    expect(profileNameSelector(globalState)).toBe("John");
  });

  it("should select profileFiscalCodeSelector", () => {
    expect(profileFiscalCodeSelector(globalState)).toBe("RSSMRA85M01H501Z");
  });

  it("should select profileNameSurnameSelector", () => {
    expect(profileNameSurnameSelector(globalState)).toBe("John Doe");
  });

  it("should select hasProfileEmailSelector", () => {
    expect(hasProfileEmailSelector(globalState)).toBe(true);
  });

  it("should select profileServicePreferencesModeSelector", () => {
    expect(profileServicePreferencesModeSelector(globalState)).toBe(
      ServicesPreferencesModeEnum.AUTO
    );
  });

  it("should select isProfileEmailAlreadyTakenSelector", () => {
    expect(isProfileEmailAlreadyTakenSelector(globalState)).toBe(false);
  });

  it("should select isProfileFirstOnBoardingSelector", () => {
    expect(isProfileFirstOnBoardingSelector(globalState)).toBe(false);
  });

  it("should select profileNotificationSettingsSelector", () => {
    expect(profileNotificationSettingsSelector(globalState)).toEqual({
      reminder: true,
      preview: true
    });
  });

  it("should select tosVersionSelector", () => {
    expect(tosVersionSelector(globalState)).toBe(3);
  });
});
