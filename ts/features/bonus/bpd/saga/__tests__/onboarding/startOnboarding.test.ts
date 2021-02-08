import { testSaga } from "redux-saga-test-plan";
import { some } from "fp-ts/lib/Option";
import { right } from "fp-ts/lib/Either";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import {
  bpdStartOnboardingWorker,
  isBpdEnabled
} from "../../orchestration/onboarding/startOnboarding";
import {
  navigateToBpdOnboardingDeclaration,
  navigateToBpdOnboardingInformationTos,
  navigateToBpdOnboardingLoadActivationStatus
} from "../../../navigation/actions";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  bpdOnboardingAcceptDeclaration,
  bpdUserActivate
} from "../../../store/actions/onboarding";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("react-native-device-info", () => {
  const getDeviceIdMock = jest.fn();
  getDeviceIdMock.mockReturnValue("");

  return {
    getDeviceId: getDeviceIdMock
  };
});

describe("bpdStartOnboardingWorker", () => {
  it("should onboard a user", () => {
    const notLoadingScreenRoute = "NotLoadingScreenRoute";

    testSaga(bpdStartOnboardingWorker)
      .next()
      .select(navigationCurrentRouteSelector)
      .next(some(notLoadingScreenRoute))
      .put(navigateToBpdOnboardingLoadActivationStatus())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(isBpdEnabled)
      .next(right(true))
      .put(fetchWalletsRequest())
      .next()
      .put(navigateToBpdOnboardingInformationTos())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .take(bpdUserActivate)
      .next()
      .put(navigateToBpdOnboardingDeclaration())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .take(bpdOnboardingAcceptDeclaration);
  });
});
