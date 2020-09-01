import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga-test-plan/matchers";
import { ActionType } from "typesafe-actions";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest,
  completeBonusVacanzeActivation
} from "../../../actions/bonusVacanze";
import {
  activationSuccess,
  navigationActions,
  networkingActivationResultActions
} from "../__mock__/networkingSagaResponseMockData";
import { handleBonusActivationSaga } from "../handleBonusActivationSaga";

jest.mock("react-native-background-timer", () => ({
    startTimer: jest.fn()
  }));

jest.mock("react-native-share", () => ({
    open: jest.fn()
  }));

type BonusVacanzeReturnType = ActionType<typeof activateBonusVacanze>;

describe("Bonus Activation Saga, mock networking saga", () => {
  it("Cancel bonus activation saga", () => expectSaga(
      handleBonusActivationSaga,
      mockRemote(activationSuccess.results)
    )
      .provide([
        [
          select(navigationCurrentRouteSelector),
          fromNullable(BONUSVACANZE_ROUTES.ACTIVATION.LOADING)
        ]
      ])
      .dispatch(cancelBonusVacanzeRequest())
      .put(NavigationActions.back())
      .run());
  networkingActivationResultActions.map(networkingScenario =>
    navigationActions.map(navigationScenario =>
      it(`${networkingScenario.displayName} with ${navigationScenario.displayName}`, () => expectSagaFactory(
          navigationScenario.startScreen,
          networkingScenario.results,
          [
            ...networkingScenario.expectedActions,
            ...navigationScenario.expectedActions
          ]
        ))
    )
  );
});

const mockRemote = (result: BonusVacanzeReturnType) =>
  // eslint-disable-next-line require-yield
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
      .dispatch(completeBonusVacanzeActivation())
      .run()
      .then(results => {
        expect(results.effects.select.length).toEqual(1);
        // in this phase the put in the store is not tested, at the end I should have only one put action left
        expect(results.effects.put.length).toEqual(1);
      })
  );
};
