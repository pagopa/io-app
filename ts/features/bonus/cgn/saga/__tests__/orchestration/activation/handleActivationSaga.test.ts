import { testSaga } from "redux-saga-test-plan";
import { some } from "fp-ts/lib/Option";
import { cgnActivationWorker } from "../../../orchestration/activation/handleActivationSaga";
import { navigationCurrentRouteSelector } from "../../../../../../../store/reducers/navigation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationLoading,
  navigateToCgnActivationTimeout
} from "../../../../navigation/actions";
import { navigationHistoryPop } from "../../../../../../../store/actions/navigationHistory";
import {
  cgnActivationComplete,
  cgnActivationStatus
} from "../../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../../store/reducers/activation";
import CGN_ROUTES from "../../../../navigation/routes";

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
      .select(navigationCurrentRouteSelector)
      .next(some("ANY_ROUTE"))
      .put(navigateToCgnActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .put(navigateToCgnActivationCompleted())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .take(cgnActivationComplete);
  });

  it("should activate user's CGN already on loading screen ", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.SUCCESS
    });

    testSaga(cgnActivationWorker, cgnActivationSaga)
      .next()
      .select(navigationCurrentRouteSelector)
      .next(some(CGN_ROUTES.ACTIVATION.LOADING))
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .put(navigateToCgnActivationCompleted())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .take(cgnActivationComplete);
  });

  it("should navigate to TIMEOUT SCREEN on user's CGN activation", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.TIMEOUT
    });

    testSaga(cgnActivationWorker, cgnActivationSaga)
      .next()
      .select(navigationCurrentRouteSelector)
      .next(some("ANY_ROUTE"))
      .put(navigateToCgnActivationLoading())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .call(cgnActivationSaga)
      .next(returnedAction)
      .put(returnedAction)
      .next()
      .put(navigateToCgnActivationTimeout())
      .next()
      .put(navigationHistoryPop(1))
      .next()
      .take(cgnActivationComplete);
  });
});
