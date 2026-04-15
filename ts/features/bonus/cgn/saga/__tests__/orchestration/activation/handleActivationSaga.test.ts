import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../../../../navigation/NavigationService";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationLoading,
  navigateToCgnActivationTimeout
} from "../../../orchestration/navigation/actions";
import CGN_ROUTES from "../../../../navigation/routes";
import { cgnActivationStatus } from "../../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../../store/reducers/activation";
import { cgnActivationWorker } from "../../../orchestration/activation/handleActivationSaga";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("cgnActivationWorker", () => {
  const cgnActivationSaga = jest.fn();

  it("should activate user's CGN", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.SUCCESS
    });

    testSaga(cgnActivationWorker, cgnActivationSaga)
      .next()
      .call(NavigationService.getCurrentRouteName)
      .next("ANY_ROUTE")
      .call(navigateToCgnActivationLoading)
      .next()
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .call(navigateToCgnActivationCompleted)
      .next();
  });

  it("should activate user's CGN already on loading screen ", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.SUCCESS
    });

    testSaga(cgnActivationWorker, cgnActivationSaga)
      .next()
      .call(NavigationService.getCurrentRouteName)
      .next(CGN_ROUTES.ACTIVATION.LOADING)
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .call(navigateToCgnActivationCompleted)
      .next();
  });

  it("should navigate to TIMEOUT SCREEN on user's CGN activation", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.TIMEOUT
    });

    testSaga(cgnActivationWorker, cgnActivationSaga)
      .next()
      .call(NavigationService.getCurrentRouteName)
      .next("ANY_ROUTE")
      .call(navigateToCgnActivationLoading)
      .next()
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .call(navigateToCgnActivationTimeout)
      .next();
  });
});
