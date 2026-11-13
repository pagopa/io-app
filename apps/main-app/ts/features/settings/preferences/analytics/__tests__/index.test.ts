import { mixpanelTrack } from "../../../../../mixpanel";
import {
  updateMixpanelMessageLanguage,
  updateMixpanelUILanguage
} from "../../../../../mixpanelConfig/uiLanguage";
import {
  trackLanguagePreferenceSelected,
  trackMessageLanguageUpdate,
  trackPreferencesScreenView,
  trackUILanguageUpdate
} from "../index";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/uiLanguage", () => ({
  updateMixpanelMessageLanguage: jest.fn(),
  updateMixpanelUILanguage: jest.fn()
}));

describe("trackUILanguageUpdate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(updateMixpanelUILanguage).mockImplementation(() => true);
    jest.mocked(updateMixpanelMessageLanguage).mockImplementation(() => true);
  });

  it("updates the UI language properties before tracking the confirmed change", () => {
    trackUILanguageUpdate("it", "de");

    expect(updateMixpanelUILanguage).toHaveBeenCalledWith("de");
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_LANGUAGE_UI_UPDATED",
      {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined,
        previous_language: "it",
        current_language: "de"
      }
    );
    expect(mixpanelTrack).toHaveBeenCalledTimes(1);
    expect(
      jest.mocked(updateMixpanelUILanguage).mock.invocationCallOrder[0]
    ).toBeLessThan(jest.mocked(mixpanelTrack).mock.invocationCallOrder[0]);
  });

  it("does not update properties or track when the language is unchanged", () => {
    trackUILanguageUpdate("it", "it");

    expect(updateMixpanelUILanguage).not.toHaveBeenCalled();
    expect(mixpanelTrack).not.toHaveBeenCalled();
  });

  it("does not track when Mixpanel is not initialized", () => {
    jest.mocked(updateMixpanelUILanguage).mockReturnValue(false);

    trackUILanguageUpdate("it", "de");

    expect(mixpanelTrack).not.toHaveBeenCalled();
  });

  it("updates message language properties before tracking the confirmed change", () => {
    trackMessageLanguageUpdate("it", "en");

    expect(updateMixpanelMessageLanguage).toHaveBeenCalledWith("en");
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_LANGUAGE_MESSAGE_UPDATED",
      {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined,
        previous_language: "it",
        current_language: "en"
      }
    );
    expect(
      jest.mocked(updateMixpanelMessageLanguage).mock.invocationCallOrder[0]
    ).toBeLessThan(jest.mocked(mixpanelTrack).mock.invocationCallOrder[0]);
  });

  it("does not track a message language change when Mixpanel is not initialized", () => {
    jest.mocked(updateMixpanelMessageLanguage).mockReturnValue(false);

    trackMessageLanguageUpdate("it", "en");

    expect(mixpanelTrack).not.toHaveBeenCalled();
  });

  it("tracks the language preference row selection", () => {
    trackLanguagePreferenceSelected();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_LANGUAGE_SELECTED",
      {
        event_category: "UX",
        event_type: "action",
        flow: undefined
      }
    );
  });

  it("tracks the preferences screen view", () => {
    trackPreferencesScreenView();

    expect(mixpanelTrack).toHaveBeenCalledWith("SETTINGS_PREFERENCES", {
      event_category: "UX",
      event_type: "screen_view",
      flow: undefined
    });
  });
});
