import { Action } from "redux";
import { ActionType } from "typesafe-actions";
import { InstanceId } from "../../../../../../../definitions/bonus_vacanze/InstanceId";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { mockedBonus } from "../../../../mock/mockData";
import {
  navigateToBonusActivationCompleted,
  navigateToBonusActivationLoading,
  navigateToBonusActivationTimeout,
  navigateToBonusActiveDetailScreen,
  navigateToBonusAlreadyExists,
  navigateToEligibilityExpired
} from "../../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import { activateBonusVacanze } from "../../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../../reducers/activation";

// This file mocks response from the networking saga.

export interface IExpectedActions {
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
  expectedActions: [navigateToBonusActivationLoading(), navigationHistoryPop(1)]
};

interface NetworkingResults extends IExpectedActions {
  results: ActionType<typeof activateBonusVacanze>;
}

// When the saga is completed with a `completeBonusVacanzeActivation` and no a valid payload is found
// return to wallet. To test the saga, after the networking part a `completeDummyActions` is executed.
export const completeBonusDefaultActions: ReadonlyArray<Action> = [
  navigateToWalletHome(),
  navigationHistoryPop(1)
];

export const activationSuccess: NetworkingResults = {
  displayName: "activationSuccess",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.SUCCESS,
    activation: mockedBonus,
    instanceId: { id: "unique_id" } as InstanceId
  }),
  expectedActions: [
    navigateToBonusActivationCompleted(),
    navigationHistoryPop(1),
    navigateToBonusActiveDetailScreen({ bonus: mockedBonus }),
    navigationHistoryPop(1)
  ]
};

export const activationTimeout: NetworkingResults = {
  displayName: "activationTimeout",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.TIMEOUT,
    instanceId: { id: "unique_id" } as InstanceId
  }),
  expectedActions: [
    navigateToBonusActivationTimeout(),
    navigationHistoryPop(1),
    ...completeBonusDefaultActions
  ]
};

export const activationExpired: NetworkingResults = {
  displayName: "activationTimeout",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.ELIGIBILITY_EXPIRED
  }),
  expectedActions: [
    navigateToEligibilityExpired(),
    navigationHistoryPop(1),
    ...completeBonusDefaultActions
  ]
};

export const activationExists: NetworkingResults = {
  displayName: "activationExists",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.EXISTS
  }),
  expectedActions: [
    navigateToBonusAlreadyExists(),
    navigationHistoryPop(1),
    ...completeBonusDefaultActions
  ]
};

// when an error occurs, no navigation is expected, just the reducer `isLoading` should return false
export const activationError: NetworkingResults = {
  displayName: "activationError",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.ERROR
  }),
  expectedActions: completeBonusDefaultActions
};

// This case should never happens, but in case no action is expected
export const activationUndefined: NetworkingResults = {
  displayName: "activationUndefined",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.UNDEFINED
  }),
  expectedActions: completeBonusDefaultActions
};

// This case should never happens, but in case no action is expected
export const activationProgress: NetworkingResults = {
  displayName: "activationProgress",
  results: activateBonusVacanze.success({
    status: BonusActivationProgressEnum.PROGRESS
  }),
  expectedActions: completeBonusDefaultActions
};

export const networkingActivationResultActions: ReadonlyArray<NetworkingResults> = [
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
