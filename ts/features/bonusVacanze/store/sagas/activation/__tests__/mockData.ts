import { Action } from "redux";
import { ActionType } from "typesafe-actions";
import { InstanceId } from "../../../../../../../definitions/bonus_vacanze/InstanceId";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { mockedBonus } from "../../../../mock/mockData";
import {
  navigateToBonusActivationCompleted,
  navigateToBonusActivationLoading,
  navigateToBonusActivationTimeout,
  navigateToBonusAlreadyExists,
  navigateToEligibilityExpired
} from "../../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import { bonusVacanzeActivation } from "../../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../../reducers/activation";

interface IExpectedActions {
  displayName: string;
  expectedActions: ReadonlyArray<Action>;
}

interface StartScreenScenario extends IExpectedActions {
  startScreen: string;
}

// when start from loading screen, no additional navigation actions are expected
export const startFromLoadingScreen: StartScreenScenario = {
  displayName: "startFromLoadingScreen",
  startScreen: BONUSVACANZE_ROUTES.ACTIVATION.LOADING,
  expectedActions: []
};

// when start from another screen, a navigateToBonusActivationAction is expected
export const startFromAnotherScreen: StartScreenScenario = {
  displayName: "startFromAnotherScreen",
  startScreen: BONUSVACANZE_ROUTES.MAIN,
  expectedActions: [navigateToBonusActivationLoading()]
};

interface NetworkingResults extends IExpectedActions {
  results: ActionType<typeof bonusVacanzeActivation>;
}

export const activationSuccess: NetworkingResults = {
  displayName: "activationSuccess",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.SUCCESS,
    activation: mockedBonus,
    instanceId: { id: "unique_id" } as InstanceId
  }),
  expectedActions: [
    navigateToBonusActivationCompleted(),
    navigationHistoryPop(1)
  ]
};

export const activationTimeout: NetworkingResults = {
  displayName: "activationTimeout",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.TIMEOUT,
    instanceId: { id: "unique_id" } as InstanceId
  }),
  expectedActions: [navigateToBonusActivationTimeout(), navigationHistoryPop(1)]
};

export const activationExpired: NetworkingResults = {
  displayName: "activationTimeout",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.ELIGIBILITY_EXPIRED
  }),
  expectedActions: [navigateToEligibilityExpired(), navigationHistoryPop(1)]
};

export const activationExists: NetworkingResults = {
  displayName: "activationExists",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.EXISTS
  }),
  expectedActions: [navigateToBonusAlreadyExists(), navigationHistoryPop(1)]
};

// when an error occurs, no navigation is expected, just the reducer `isLoading` should return false
export const activationError: NetworkingResults = {
  displayName: "activationError",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.ERROR
  }),
  expectedActions: []
};

// This case should never happens, but in case no action is expected
export const activationUndefined: NetworkingResults = {
  displayName: "activationUndefined",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.UNDEFINED
  }),
  expectedActions: []
};

// This case should never happens, but in case no action is expected
export const activationProgress: NetworkingResults = {
  displayName: "activationProgress",
  results: bonusVacanzeActivation.success({
    status: BonusActivationProgressEnum.PROGRESS
  }),
  expectedActions: []
};

export const networkingActivationResultActions: ReadonlyArray<
  NetworkingResults
> = [
  activationSuccess,
  activationTimeout,
  activationExists,
  activationExpired,
  activationError,
  activationUndefined,
  activationProgress
];

export const navigationActions: ReadonlyArray<StartScreenScenario> = [
  startFromAnotherScreen,
  startFromLoadingScreen
];

test.skip("mockDataOnlyFile", () => undefined);
