import * as Mixpanel from "../../../../mixpanel";
import {
  trackSettingsDiscoverBannerClosure,
  trackSettingsDiscoverBannerTap,
  trackSettingsDiscoverBannerVisualized
} from "..";

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

const getMockMixpanelTrack = () =>
  jest
    .spyOn(Mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
