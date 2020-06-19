import { right } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
import { Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { select } from "redux-saga-test-plan/matchers";
import { navigateToWalletHome } from "../../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../../navigation/routes";
import { completeBonusVacanzeActivation } from "../../../../actions/bonusVacanze";
import { bonusActivationSaga } from "../../getBonusActivationSaga";
import { handleBonusActivationSaga } from "../../handleBonusActivationSaga";
import {
  ActivationBackendResponse,
  backendIntegrationTestCases
} from "./mockData";

jest.mock("react-native-background-timer", () => {
  return {
    startTimer: jest.fn()
  };
});

jest.mock("react-native-share", () => {
  return {
    open: jest.fn()
  };
});

describe("Bonus Activation Saga Integration Test", () => {
  it("Test", () => {
    const startBonusActivation = jest.fn();
    const getActivationById = jest.fn();

    return expectSaga(
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
          right({ status: 409, value: {} })
        ],
        [matchers.call.fn(getActivationById), right({ status: 500, value: {} })]
      ])
      .put(navigateToWalletHome())
      .run();
  });
  backendIntegrationTestCases.map(testCase =>
    testCase.responses.map(response => {
      const bonusActivationById = response.getBonusActivationResponseById
        ? `with GetBonusActivationResponseById[${
            response.getBonusActivationResponseById.status
          }]`
        : "";

      return it(`${testCase.displayName}, startBonusActivation[${
        response.startBonusActivationResponse.status
      }] ${bonusActivationById}`, () =>
        expectSagaFactory(response, testCase.expectedActions));
    })
  );
});

const expectSagaFactory = (
  backendResponses: ActivationBackendResponse,
  actionToVerify: ReadonlyArray<Action>
) => {
  const startBonusActivation = jest.fn();
  const getActivationById = jest.fn();
  const baseSaga = expectSaga(
    handleBonusActivationSaga,
    bonusActivationSaga(startBonusActivation, getActivationById)
  ).provide([
    [
      select(navigationCurrentRouteSelector),
      fromNullable(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
    ],
    [
      matchers.call.fn(startBonusActivation),
      right(backendResponses.startBonusActivationResponse)
    ],
    [
      matchers.call.fn(getActivationById),
      right(backendResponses.getBonusActivationResponseById)
    ]
  ]);
  return (
    actionToVerify
      .reduce((acc, val) => acc.put(val), baseSaga)
      // when the last event completeBonusVacanze is received, the navigation stack is popped
      .dispatch(completeBonusVacanzeActivation())
      .put(navigationHistoryPop(1))
      .run()
      .then(results => {
        expect(results.effects.select.length).toEqual(1);
        // in this phase the put in the store is not tested, at the end I should have only one put action left
        expect(results.effects.put.length).toEqual(1);
      })
  );
};
