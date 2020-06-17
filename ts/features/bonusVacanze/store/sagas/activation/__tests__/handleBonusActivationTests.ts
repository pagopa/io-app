import { fromNullable } from "fp-ts/lib/Option";
import { Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga-test-plan/matchers";
import { ActionType } from "typesafe-actions";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import {
  bonusVacanzeActivation,
  cancelBonusRequest,
  completeBonusVacanze
} from "../../../actions/bonusVacanze";
import { handleBonusActivationSaga } from "../handleBonusActivationSaga";
import {
  navigationActions,
  networkingActivationResultActions
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

type BonusVacanzeReturnType = ActionType<typeof bonusVacanzeActivation>;

describe("Bonus Activation Saga", () => {
  it("Cancel bonus activation saga", () => {
    return expectSaga(handleBonusActivationSaga, mockRemote)
      .provide([
        [
          select(navigationCurrentRouteSelector),
          fromNullable(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
        ]
      ])
      .dispatch(cancelBonusRequest())
      .put(navigateToWalletHome())
      .put(navigationHistoryPop(1))
      .run();
  });
  networkingActivationResultActions.map(networkingScenario =>
    navigationActions.map(navigationScenario =>
      it(`${networkingScenario.displayName} with ${
        navigationScenario.displayName
      }`, () => {
        return expectSagaFactory(
          navigationScenario.startScreen,
          networkingScenario.results,
          [
            ...networkingScenario.expectedActions,
            ...navigationScenario.expectedActions
          ]
        );
      })
    )
  );
});

const mockRemote = (result: BonusVacanzeReturnType) =>
  function* mockRemoteGenerator() {
    return result;
  };

const expectSagaFactory = (
  startScreen: string,
  networkingResult: BonusVacanzeReturnType,
  actionToVerify: ReadonlyArray<Action>
) => {
  const baseSaga = expectSaga(
    handleBonusActivationSaga,
    mockRemote(networkingResult)
  ).provide([
    [select(navigationCurrentRouteSelector), fromNullable(startScreen)]
  ]);
  return (
    actionToVerify
      .reduce((acc, val) => acc.put(val), baseSaga)
      // when the last event completeBonusVacanze is received, the navigation stack is popped
      .dispatch(completeBonusVacanze())
      .put(navigationHistoryPop(1))
      .run()
      .then(results => {
        expect(results.effects.select.length).toEqual(1);
        // in this phase the put in the store is not tested, at the end I should have only one put action left
        expect(results.effects.put.length).toEqual(1);
      })
  );
};
