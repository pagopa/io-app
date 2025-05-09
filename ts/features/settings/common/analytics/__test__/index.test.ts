import { getType } from "typesafe-actions";
import * as Mixpanel from "../../../../../mixpanel";
import {
  getNotificationPermissionType,
  getNotificationPreferenceConfiguration,
  getNotificationTokenType,
  trackAppearancePreferenceScreenView,
  trackAppearancePreferenceTypefaceUpdate,
  trackCreatePinSuccess,
  trackIngressScreen,
  trackMixpanelScreen,
  trackNotificationPreferenceConfiguration,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus,
  trackPinError,
  trackProfileLoadSuccess,
  trackSettingsDiscoverBannerClosure,
  trackSettingsDiscoverBannerTap,
  trackSettingsDiscoverBannerVisualized
} from "..";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileLoadSuccess } from "../../store/actions";

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it(`'trackSettingsDiscoverBannerVisualized' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackSettingsDiscoverBannerVisualized();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("BANNER");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view",
      banner_id: "settingsDiscoveryBanner",
      banner_page: "MESSAGES_HOME",
      banner_landing: "SETTINGS_MAIN"
    });
  });
  it(`'trackSettingsDiscoverBannerClosure' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackSettingsDiscoverBannerTap();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("TAP_BANNER");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      banner_id: "settingsDiscoveryBanner",
      banner_page: "MESSAGES_HOME",
      banner_landing: "SETTINGS_MAIN"
    });
  });
  it(`'trackSettingsDiscoverBannerTap' should have expected event name and properties`, () => {
    const mockMixpanelTrack = getMockMixpanelTrack();

    void trackSettingsDiscoverBannerClosure();

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("CLOSE_BANNER");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action",
      banner_id: "settingsDiscoveryBanner",
      banner_page: "MESSAGES_HOME",
      banner_landing: "SETTINGS_MAIN"
    });
  });
});

describe("getNotificationTokenType", () => {
  [
    [undefined, "no"],
    ["", "no"],
    [" ", "no"],
    ["whatever", "yes"]
  ].forEach(tokenValue => {
    it(`should return '${tokenValue[1]}' for input '${tokenValue[0]}'`, () => {
      const state = {
        notifications: {
          installation: {
            token: tokenValue[0]
          }
        }
      } as GlobalState;
      const output = getNotificationTokenType(state);
      expect(output).toBe(tokenValue[1]);
    });
  });
});

describe("should works all functions", () => {
  it("trackProfileLoadSuccess should track correctly", async () => {
    const state = {} as GlobalState;
    const mockMixpanelTrack = getMockMixpanelTrack();
    const updateProfile = jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../../../../mixpanelConfig/profileProperties"),
        "updateMixpanelProfileProperties"
      )
      .mockResolvedValue(undefined);
    const updateSuper = jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../../../../mixpanelConfig/superProperties"),
        "updateMixpanelSuperProperties"
      )
      .mockResolvedValue(undefined);

    await trackProfileLoadSuccess(state);

    expect(updateProfile).toHaveBeenCalledWith(state);
    expect(updateSuper).toHaveBeenCalledWith(state);
    expect(mockMixpanelTrack).toHaveBeenCalledWith(getType(profileLoadSuccess));
  });

  it("trackIngressScreen should call mixpanelTrack with correct event", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackIngressScreen();
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "INITIALIZATION_LOADING",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view"
      })
    );
  });

  it("trackPinError should track error with type and flow", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackPinError("creation", "onBoarding");
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "PIN_CREATION_ERROR",
      expect.objectContaining({
        error: "creation",
        flow: "onBoarding",
        event_type: "error"
      })
    );
  });

  it("trackAppearancePreferenceTypefaceUpdate should track font choice and update profile", () => {
    const state = {} as GlobalState;
    const mockMixpanelTrack = getMockMixpanelTrack();
    const updateProfile = jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../../../../mixpanelConfig/profileProperties"),
        "updateMixpanelProfileProperties"
      )
      .mockResolvedValue(undefined);

    trackAppearancePreferenceTypefaceUpdate("comfortable", state);

    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_UI_FONT_UPDATE",
      expect.objectContaining({
        current_font: "comfortable",
        event_category: "UX",
        event_type: "action"
      })
    );
    expect(updateProfile).toHaveBeenCalledWith(state, {
      property: "FONT_PREFERENCE",
      value: "comfortable"
    });
  });

  it("trackMixpanelScreen should track screen view with flow", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackMixpanelScreen("onBoarding");
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "TRACKING",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view",
        flow: "onBoarding"
      })
    );
  });

  it("trackCreatePinSuccess should track pin creation success with flow", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackCreatePinSuccess("onBoarding");
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "CREATE_PIN_SUCCESS",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        flow: "onBoarding"
      })
    );
  });

  it("getNotificationPreferenceConfiguration should return correct configuration string", () => {
    expect(getNotificationPreferenceConfiguration(true, true)).toBe("complete");
    expect(getNotificationPreferenceConfiguration(true, false)).toBe(
      "reminder"
    );
    expect(getNotificationPreferenceConfiguration(false, true)).toBe("preview");
    expect(getNotificationPreferenceConfiguration(false, false)).toBe("none");
    expect(getNotificationPreferenceConfiguration(undefined, true)).toBe(
      "not set"
    );
    expect(getNotificationPreferenceConfiguration(true, undefined)).toBe(
      "not set"
    );
  });

  it("getNotificationPermissionType should return correct permission type", () => {
    expect(getNotificationPermissionType(true)).toBe("enabled");
    expect(getNotificationPermissionType(false)).toBe("disabled");
  });

  it("trackAppearancePreferenceScreenView should track screen view", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackAppearancePreferenceScreenView();
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_UI",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view"
      })
    );
  });

  it("trackNotificationsPreferencesPreviewStatus should track correctly", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackNotificationsPreferencesPreviewStatus(true, "onBoarding");
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "NOTIFICATIONS_PREFERENCES_PREVIEW_STATUS",
      expect.objectContaining({
        enabled: true,
        flow: "onBoarding",
        event_type: "action",
        event_category: "UX"
      })
    );
  });

  it("trackNotificationsPreferencesReminderStatus should track correctly", () => {
    const mockMixpanelTrack = getMockMixpanelTrack();
    trackNotificationsPreferencesReminderStatus(false, "onBoarding");
    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "NOTIFICATIONS_PREFERENCES_REMINDER_STATUS",
      expect.objectContaining({
        enabled: false,
        flow: "onBoarding",
        event_type: "action",
        event_category: "UX"
      })
    );
  });

  it("trackNotificationPreferenceConfiguration should update profile and track", async () => {
    const state = {} as GlobalState;
    const mockMixpanelTrack = getMockMixpanelTrack();

    const updateProfile = jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../../../../mixpanelConfig/profileProperties"),
        "updateMixpanelProfileProperties"
      )
      .mockResolvedValue(undefined);

    const updateSuper = jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../../../../mixpanelConfig/superProperties"),
        "updateMixpanelSuperProperties"
      )
      .mockResolvedValue(undefined);

    await trackNotificationPreferenceConfiguration(
      true,
      false,
      "onBoarding",
      state
    );

    expect(updateProfile).toHaveBeenCalledWith(state, {
      property: "NOTIFICATION_CONFIGURATION",
      value: "reminder"
    });

    expect(updateSuper).toHaveBeenCalledWith(state, {
      property: "NOTIFICATION_CONFIGURATION",
      value: "reminder"
    });

    expect(mockMixpanelTrack).toHaveBeenCalledWith(
      "NOTIFICATION_PREFERENCE_CONFIGURATION",
      expect.objectContaining({
        configuration: "reminder",
        flow: "onBoarding",
        event_type: "action"
      })
    );
  });
});

const getMockMixpanelTrack = () =>
  jest
    .spyOn(Mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
