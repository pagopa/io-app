import { profileBannerToShowSelector } from "..";
import { GlobalState } from "../../../../../store/reducers/types";

const getState = (notifs: boolean, profileBanner: boolean) =>
  ({
    features: {
      profileSettings: {
        showProfileBanner: profileBanner
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
    const bannerToShow = profileBannerToShowSelector(getState(false, true));

    expect(bannerToShow).toEqual(expected);
  });
  it("should return 'NOTIFICATIONS' if notifications and profile banner are not enabled", () => {
    const expected = "NOTIFICATIONS";
    const bannerToShow = profileBannerToShowSelector(getState(false, false));

    expect(bannerToShow).toEqual(expected);
  });

  it("should return 'PROFILE_BANNER' if notifications are enabled and the profile banner is enabled", () => {
    const expected = "PROFILE_BANNER";

    const bannerToShow = profileBannerToShowSelector(getState(true, true));

    expect(bannerToShow).toEqual(expected);
  });

  it("should return undefined if notifications are enabled and the profile banner is disabled", () => {
    const expected = undefined;

    const bannerToShow = profileBannerToShowSelector(getState(true, false));

    expect(bannerToShow).toEqual(expected);
  });
});
