import * as O from "fp-ts/lib/Option";
import * as appVersion from "../../../../../../utils/appVersion";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isFavouriteServicesEnabledSelector } from "../remoteConfig";

describe("isFavouriteServicesEnabledSelector", () => {
  it("should return false, when min_app_version is greater than current version", () => {
    const state = {
      remoteConfig: O.some({
        services: {
          favouriteServices: {
            min_app_version: { android: "3.21.0.0", ios: "3.21.0.0" }
          }
        }
      })
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "2.0.0.0");
    expect(isFavouriteServicesEnabledSelector(state)).toBe(false);
  });

  it("should return true, when min_app_version is equal to current version", () => {
    const state = {
      remoteConfig: O.some({
        services: {
          favouriteServices: {
            min_app_version: { android: "3.21.0.0", ios: "3.21.0.0" }
          }
        }
      })
    } as GlobalState;
    jest
      .spyOn(appVersion, "getAppVersion")
      .mockImplementation(() => "3.21.0.0");
    expect(isFavouriteServicesEnabledSelector(state)).toBe(true);
  });

  it("should return true, when min_app_version is less than current version", () => {
    const state = {
      remoteConfig: O.some({
        services: {
          favouriteServices: {
            min_app_version: { android: "3.21.0.0", ios: "3.21.0.0" }
          }
        }
      })
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "4.0.0.0");
    expect(isFavouriteServicesEnabledSelector(state)).toBe(true);
  });
});
