import { CommonActions } from "@react-navigation/native";
import { testSaga } from "redux-saga-test-plan";
import { call, take } from "redux-saga/effects";

import NavigationService from "../../../../../../../navigation/NavigationService";
import CGN_ROUTES from "../../../../navigation/routes";
import {
  cgnActivationCancel,
  cgnActivationStatus
} from "../../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../../store/reducers/activation";
import {
  cgnActivationWorker,
  handleCgnActivationSaga
} from "../../../orchestration/activation/handleActivationSaga";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationLoading,
  navigateToCgnActivationTimeout
} from "../../../orchestration/navigation/actions";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("cgnActivationWorker", () => {
  const cgnActivationSaga = jest.fn();

  it("should activate user's CGN", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.SUCCESS
    });

    expect(() => {
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
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should activate user's CGN already on loading screen", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.SUCCESS
    });

    expect(() => {
      testSaga(cgnActivationWorker, cgnActivationSaga)
        .next()
        .call(NavigationService.getCurrentRouteName)
        .next(CGN_ROUTES.ACTIVATION.LOADING)
        .call(cgnActivationSaga)
        .next(returnedAction)
        .put(returnedAction)
        .next()
        .call(navigateToCgnActivationCompleted)
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should navigate to TIMEOUT SCREEN on user's CGN activation", () => {
    const returnedAction = cgnActivationStatus.success({
      status: CgnActivationProgressEnum.TIMEOUT
    });

    expect(() => {
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
        .next()
        .isDone();
    }).not.toThrow();
  });

  it("should stay on loading screen when activation fails", () => {
    const returnedAction = cgnActivationStatus.failure(new Error("boom"));

    expect(() => {
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
        .isDone();
    }).not.toThrow();
  });
});

describe("handleCgnActivationSaga", () => {
  it("should navigate back on cancel action", () => {
    const cgnActivationSaga = jest.fn();

    expect(() => {
      testSaga(handleCgnActivationSaga, cgnActivationSaga)
        .next()
        .race({
          activation: call(cgnActivationWorker, cgnActivationSaga),
          cancelAction: take(cgnActivationCancel)
        })
        .next({ cancelAction: cgnActivationCancel() })
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.goBack()
        )
        .next()
        .isDone();
    }).not.toThrow();
  });
});
