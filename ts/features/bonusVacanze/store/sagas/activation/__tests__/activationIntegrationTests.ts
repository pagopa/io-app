import { Either, right } from "fp-ts/lib/Either";
import { fromNullable, some } from "fp-ts/lib/Option";
import { Errors } from "io-ts";
import { NavigationActions } from "react-navigation";
import { Action, combineReducers } from "redux";
import { expectSaga, RunResult } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { select } from "redux-saga-test-plan/matchers";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import {
  cancelBonusVacanzeRequest,
  completeBonusVacanzeActivation,
  showBonusVacanze
} from "../../../actions/bonusVacanze";
import bonusVacanzeActivationReducer, {
  BonusActivationProgressEnum
} from "../../../reducers/activation";
import allActiveReducer from "../../../reducers/allActive";
import {
  ActivationBackendResponse,
  backendIntegrationTestCases,
  MockActivationState
} from "../__mock__/backendMockData";
import { bonusActivationSaga } from "../getBonusActivationSaga";
import { handleBonusActivationSaga } from "../handleBonusActivationSaga";

jest.mock("react-native-background-timer", () => ({
    startTimer: jest.fn()
  }));

jest.mock("react-native-share", () => ({
    open: jest.fn()
  }));

const activationReducer = combineReducers<MockActivationState, Action>({
  activation: bonusVacanzeActivationReducer,
  allActive: allActiveReducer
});

const getDisplayNameBackendResponse = (value: Either<Errors, any>): string => value.fold(
    _ => "Left error",
    r => r ? (r.status as string) : "undefined"
  );
/** This test suite test the integration of the Activation saga, mocking the backend responses
 *
 */
describe("Bonus Activation Saga Integration Test", () => {
  it("Cancel A bonus request after server error", () => {
    const startBonusActivation = jest.fn();
    const getActivationById = jest.fn();

    return expectSaga(
      handleBonusActivationSaga,
      bonusActivationSaga(startBonusActivation, getActivationById)
    )
      .withReducer(activationReducer)
      .provide([
        [
          select(navigationCurrentRouteSelector),
          some(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
        ],
        [
          matchers.call.fn(startBonusActivation),
          right({ status: 500, value: {} })
        ]
      ])
      .dispatch(cancelBonusVacanzeRequest())
      .put(NavigationActions.back())
      .hasFinalState({
        activation: { status: BonusActivationProgressEnum.ERROR },
        allActive: {}
      } as MockActivationState)
      .run()
      .then(expectFinalSagaState);
  });
  // TODO: refactor with the previous test
  it("Handle showBonusVacanze", () => {
    const startBonusActivation = jest.fn();
    const getActivationById = jest.fn();

    return expectSaga(
      handleBonusActivationSaga,
      bonusActivationSaga(startBonusActivation, getActivationById)
    )
      .withReducer(activationReducer)
      .provide([
        [
          select(navigationCurrentRouteSelector),
          some(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
        ],
        [
          matchers.call.fn(startBonusActivation),
          right({ status: 500, value: {} })
        ]
      ])
      .dispatch(showBonusVacanze())
      .put(navigateToWalletHome())
      .put(navigationHistoryPop(1))
      .hasFinalState({
        activation: { status: BonusActivationProgressEnum.ERROR },
        allActive: {}
      } as MockActivationState)
      .run()
      .then(expectFinalSagaState);
  });
  backendIntegrationTestCases.map(testCase =>
    testCase.responses.map(response => it(`${
        testCase.displayName
      }, startBonusActivation[${getDisplayNameBackendResponse(
        response.startBonusActivationResponse
      )}] with GetBonusActivationResponseById[${getDisplayNameBackendResponse(
        response.getBonusActivationResponseById
      )}]`, () =>
        expectSagaFactory(
          response,
          testCase.expectedActions,
          testCase.finalState
        )))
  );
});

const expectSagaFactory = (
  backendResponses: ActivationBackendResponse,
  actionToVerify: ReadonlyArray<Action>,
  finalState: MockActivationState
) => {
  const startBonusActivation = jest.fn();
  const getActivationById = jest.fn();
  const baseSaga = expectSaga(
    handleBonusActivationSaga,
    bonusActivationSaga(startBonusActivation, getActivationById)
  )
    .provide([
      [
        select(navigationCurrentRouteSelector),
        fromNullable(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
      ],
      [
        matchers.call.fn(startBonusActivation),
        backendResponses.startBonusActivationResponse
      ],
      [
        matchers.call.fn(getActivationById),
        backendResponses.getBonusActivationResponseById
      ]
    ])
    .withReducer(activationReducer);
  return (
    actionToVerify
      .reduce((acc, val) => acc.put(val), baseSaga)
      // when the last event completeBonusVacanze is received, the navigation stack is popped
      .dispatch(completeBonusVacanzeActivation())
      .hasFinalState(finalState)
      .run()
      .then(expectFinalSagaState)
  );
};

const expectFinalSagaState = (result: RunResult) => {
  expect(result.effects.select.length).toEqual(1);
  // in this phase the put in the store is not tested, at the end I should have only one put action left
  expect(result.effects.put.length).toEqual(1);
};
