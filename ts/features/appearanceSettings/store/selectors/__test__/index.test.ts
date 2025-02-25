import { settingsBannerToShowSelector } from "..";
import { GlobalState } from "../../../../../store/reducers/types";

const getState = (notifs: boolean, appearanceBanner: boolean) =>
  ({
    features: {
      appearanceSettings: {
        showAppearanceBanner: appearanceBanner
      }
    },
    notifications: {
      environment: {
        systemNotificationsEnabled: notifs
      }
    }
  } as GlobalState);

describe("profileBannerToShowSelector", () => {
  it("should return 'NOTIFICATIONS' if notifications are not enabled", () => {
    const expected = "NOTIFICATIONS";
    const bannerToShow = settingsBannerToShowSelector(getState(false, true));

    expect(bannerToShow).toEqual(expected);
  });
  it("should return 'NOTIFICATIONS' if notifications and profile banner are not enabled", () => {
    const expected = "NOTIFICATIONS";
    const bannerToShow = settingsBannerToShowSelector(getState(false, false));

    expect(bannerToShow).toEqual(expected);
  });

  it("should return 'APPEARANCE_SETTINGS_BANNER' if notifications are enabled and the profile banner is enabled", () => {
    const expected = "APPEARANCE_SETTINGS_BANNER";

    const bannerToShow = settingsBannerToShowSelector(getState(true, true));

    expect(bannerToShow).toEqual(expected);
  });

  it("should return undefined if notifications are enabled and the profile banner is disabled", () => {
    const expected = undefined;

    const bannerToShow = settingsBannerToShowSelector(getState(true, false));

    expect(bannerToShow).toEqual(expected);
  });
});
