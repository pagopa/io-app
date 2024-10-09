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
    const expectedResult = "NOTIFICATIONS";
    const actualResult = profileBannerToShowSelector(getState(false, true));

    expect(actualResult).toEqual(expectedResult);
  });

  it("should return 'PROFILE_BANNER' if notifications are enabled and the profile banner is enabled", () => {
    const expectedResult = "PROFILE_BANNER";

    const actualResult = profileBannerToShowSelector(getState(true, true));

    expect(actualResult).toEqual(expectedResult);
  });

  it("should return undefined if notifications are enabled and the profile banner is disabled", () => {
    const expectedResult = undefined;

    const actualResult = profileBannerToShowSelector(getState(true, false));

    expect(actualResult).toEqual(expectedResult);
  });
});
