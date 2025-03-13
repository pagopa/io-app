import * as Mixpanel from "../../../../mixpanel";
import {
  getNotificationTokenType,
  trackSettingsDiscoverBannerClosure,
  trackSettingsDiscoverBannerTap,
  trackSettingsDiscoverBannerVisualized
} from "..";
import { GlobalState } from "../../../../store/reducers/types";
import { NotificationsState } from "../../../../features/pushNotifications/store/reducers";

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

const getMockMixpanelTrack = () =>
  jest
    .spyOn(Mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
