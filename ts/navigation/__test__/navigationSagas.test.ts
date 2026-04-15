/* eslint-disable functional/no-let */
import { runSaga } from "redux-saga";
import * as NavigationService from "../NavigationService";
import * as analytics from "../analytics/navigation";
import {
  waitForNavigatorServiceInitialization,
  waitForMainNavigator
} from "../saga/navigation";

jest.mock("../NavigationService");
jest.mock("../analytics/navigation");

describe("Navigation sagas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("waitForNavigatorServiceInitialization", () => {
    it("should call trackNavigationServiceInitializationCompleted when navigator is ready immediately", async () => {
      (NavigationService.getIsNavigationReady as jest.Mock).mockReturnValue(
        true
      );

      await runSaga({}, waitForNavigatorServiceInitialization).toPromise();

      expect(
        analytics.trackNavigationServiceInitializationCompleted
      ).toHaveBeenCalledTimes(1);
      expect(
        analytics.trackNavigationServiceInitializationTimeout
      ).not.toHaveBeenCalled();
    });

    it("should poll until navigator is ready and call timeout if necessary", async () => {
      let callCount = 0;
      (NavigationService.getIsNavigationReady as jest.Mock).mockImplementation(
        () => {
          callCount++;
          // Ready after 3 calls
          return callCount >= 3;
        }
      );

      let perfTime = 0;
      jest
        .spyOn(performance, "now")
        .mockImplementation(() => (perfTime += 1000));

      await runSaga({}, waitForNavigatorServiceInitialization).toPromise();

      expect(
        analytics.trackNavigationServiceInitializationTimeout
      ).toHaveBeenCalledTimes(1);
      expect(
        analytics.trackNavigationServiceInitializationCompleted
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("waitForMainNavigator", () => {
    it("should call trackMainNavigatorStackReadyOk when main navigator is ready immediately", async () => {
      (
        NavigationService.default.getIsMainNavigatorReady as jest.Mock
      ).mockReturnValue(true);

      await runSaga({}, waitForMainNavigator).toPromise();

      expect(analytics.trackMainNavigatorStackReadyOk).toHaveBeenCalledTimes(1);
      expect(
        analytics.trackMainNavigatorStackReadyTimeout
      ).not.toHaveBeenCalled();
    });

    it("should poll until main navigator is ready and call timeout if necessary", async () => {
      let callCount = 0;
      (
        NavigationService.default.getIsMainNavigatorReady as jest.Mock
      ).mockImplementation(() => {
        callCount++;
        // Ready after 4 calls
        return callCount >= 4;
      });

      let perfTime = 0;
      jest
        .spyOn(performance, "now")
        .mockImplementation(() => (perfTime += 1000));

      await runSaga({}, waitForMainNavigator).toPromise();

      expect(
        analytics.trackMainNavigatorStackReadyTimeout
      ).toHaveBeenCalledTimes(1);
      expect(analytics.trackMainNavigatorStackReadyOk).toHaveBeenCalledTimes(1);
    });
  });
});
