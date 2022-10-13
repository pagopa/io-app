import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../../../navigation/NavigationService";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import {
  navigateToBpdOnboardingDeclaration,
  navigateToBpdOnboardingInformationTos,
  navigateToBpdOnboardingLoadActivationStatus
} from "../../../navigation/actions";
import {
  bpdOnboardingAcceptDeclaration,
  bpdUserActivate
} from "../../../store/actions/onboarding";
import {
  bpdStartOnboardingWorker,
  isBpdEnabled
} from "../../orchestration/onboarding/startOnboarding";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("bpdStartOnboardingWorker", () => {
  it("should onboard a user", () => {
    const notLoadingScreenRoute = "NotLoadingScreenRoute";

    testSaga(bpdStartOnboardingWorker)
      .next()
      .call(NavigationService.getCurrentRouteName)
      .next(notLoadingScreenRoute)
      .call(navigateToBpdOnboardingLoadActivationStatus)
      .next()
      .call(isBpdEnabled)
      .next(E.right(true))
      .put(fetchWalletsRequest())
      .next()
      .call(navigateToBpdOnboardingInformationTos)
      .next()
      .take(bpdUserActivate)
      .next()
      .call(navigateToBpdOnboardingDeclaration)
      .next()
      .take(bpdOnboardingAcceptDeclaration);
  });
});
