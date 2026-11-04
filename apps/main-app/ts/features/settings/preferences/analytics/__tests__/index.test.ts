import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelUILanguage } from "../../../../../mixpanelConfig/uiLanguage";
import { trackUILanguageUpdate } from "../index";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/uiLanguage", () => ({
  updateMixpanelUILanguage: jest.fn()
}));

describe("trackUILanguageUpdate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(updateMixpanelUILanguage).mockImplementation(() => true);
  });

  it("updates the UI language properties before tracking the confirmed change", () => {
    trackUILanguageUpdate("it", "de");

    expect(updateMixpanelUILanguage).toHaveBeenCalledWith("de");
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SETTINGS_PREFERENCES_UI_LANGUAGE_UPDATE",
      {
        event_category: "UX",
        event_type: "action",
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
});
