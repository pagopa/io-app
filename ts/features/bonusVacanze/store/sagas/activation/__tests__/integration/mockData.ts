import { Either, left, right } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { pot } from "italia-ts-commons";
import { ProblemJson } from "italia-ts-commons/lib/responses";
import { NavigationActions } from "react-navigation";
import { Action } from "redux";
import { BonusActivationStatusEnum } from "../../../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { InstanceId } from "../../../../../../../../definitions/bonus_vacanze/InstanceId";
import { navigateToWalletHome } from "../../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../../store/actions/navigationHistory";
import { mockedBonus } from "../../../../../mock/mockData";
import {
  navigateToBonusActivationCompleted,
  navigateToBonusActivationTimeout,
  navigateToBonusActiveDetailScreen,
  navigateToBonusAlreadyExists,
  navigateToEligibilityExpired
} from "../../../../../navigation/action";
import {
  cancelBonusVacanzeRequest,
  checkBonusVacanzeEligibility,
  completeBonusVacanzeActivation,
  showBonusVacanze
} from "../../../../actions/bonusVacanze";
import {
  ActivationState,
  BonusActivationProgressEnum
} from "../../../../reducers/activation";
import { AllActiveState } from "../../../../reducers/allActive";
import { IExpectedActions } from "../mockData";

const genericServiceUnavailable: Either<Errors, any> = right({
  status: 500,
  value: {
    type: "https://example.com/problem/constraint-violation",
    title: "string",
    status: 500,
    detail: "There was an error processing the request",
    instance: "string"
  } as ProblemJson
});

const genericDecodingFailure = left([
  { context: [], value: new Error("decoding failure") }
]);

// mock activation for /bonus/vacanze/activations POST

const startActivationRequestCreated: Either<Errors, any> = right({
  status: 201,
  value: { id: "bonus_id" } as InstanceId
});

const startActivationProcessingRequest: Either<Errors, any> = right({
  status: 202
});

const startActivationEligibilityExpired: Either<Errors, any> = right({
  status: 403
});
const startActivationBonusAlreadyExists: Either<Errors, any> = right({
  status: 409
});
const startActivationNoToken: Either<Errors, any> = right({ status: 401 });

// mock activation /bonus/vacanze/activations/{bonus_id} GET
const getActivationSuccess: Either<Errors, any> = right({
  status: 200,
  value: mockedBonus
});

const getActivationSuccessBonusError: Either<Errors, any> = right({
  status: 200,
  value: {
    ...mockedBonus,
    status: BonusActivationStatusEnum.FAILED
  }
});

const getActivationNoToken: Either<Errors, any> = right({
  status: 401
});
const getActivationNoBonusFound: Either<Errors, any> = right({
  status: 404
});

export type MockActivationState = {
  activation: ActivationState;
  allActive: AllActiveState;
};

export type ActivationBackendResponse = {
  startBonusActivationResponse: Either<Errors, any>;
  getBonusActivationResponseById: Either<Errors, any>;
};

interface MockBackendScenario extends IExpectedActions {
  responses: ReadonlyArray<ActivationBackendResponse>;
  finalState: MockActivationState;
}

interface IMockUserActions extends IExpectedActions {
  userAction: Action;
}

// Mock user actions

const userCancel: IMockUserActions = {
  displayName: "User Cancel Action",
  userAction: cancelBonusVacanzeRequest(),
  expectedActions: [NavigationActions.back()]
};

const userCompleteActivation: IMockUserActions = {
  displayName: "User Complete Activation",
  userAction: completeBonusVacanzeActivation(),
  expectedActions: []
};

const userShowBonusVacanze: IMockUserActions = {
  displayName: "User Show Bonus Vacanze",
  userAction: showBonusVacanze(),
  expectedActions: [navigateToWalletHome(), navigationHistoryPop(1)]
};

const userRestartEligibility: IMockUserActions = {
  displayName: "User Restart Eligibility",
  userAction: checkBonusVacanzeEligibility.request(),
  expectedActions: []
};

export const possibleUserActions: ReadonlyArray<IMockUserActions> = [
  userCancel,
  userCompleteActivation,
  userShowBonusVacanze,
  userRestartEligibility
];

// Mock Backend response
export const success: MockBackendScenario = {
  displayName: "success",
  responses: [
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: getActivationSuccess
    }
  ],
  expectedActions: [
    navigateToBonusActivationCompleted(),
    navigationHistoryPop(1),
    navigateToBonusActiveDetailScreen({ bonus: mockedBonus }),
    navigationHistoryPop(1)
  ],
  finalState: {
    activation: { status: BonusActivationProgressEnum.SUCCESS },
    allActive: { [mockedBonus.id]: pot.some(mockedBonus) }
  }
};

export const eligibilityExpired: MockBackendScenario = {
  displayName: "eligibility expired",
  responses: [
    {
      startBonusActivationResponse: startActivationEligibilityExpired,
      getBonusActivationResponseById: right(undefined)
    }
  ],
  expectedActions: [navigateToEligibilityExpired(), navigationHistoryPop(1)],
  finalState: {
    activation: { status: BonusActivationProgressEnum.ELIGIBILITY_EXPIRED },
    allActive: {}
  }
};

export const bonusAlreadyExists: MockBackendScenario = {
  displayName: "bonus already exists",
  responses: [
    {
      startBonusActivationResponse: startActivationBonusAlreadyExists,
      getBonusActivationResponseById: right(undefined)
    }
  ],
  expectedActions: [navigateToBonusAlreadyExists(), navigationHistoryPop(1)],
  finalState: {
    activation: { status: BonusActivationProgressEnum.EXISTS },
    allActive: {}
  }
};

// TODO: add others timeout case
export const timeout: MockBackendScenario = {
  displayName: "timeout",
  responses: [
    {
      startBonusActivationResponse: startActivationProcessingRequest,
      getBonusActivationResponseById: right(undefined)
    }
  ],
  expectedActions: [
    navigateToBonusActivationTimeout(),
    navigationHistoryPop(1)
  ],
  finalState: {
    activation: { status: BonusActivationProgressEnum.TIMEOUT },
    allActive: {}
  }
};

export const error: MockBackendScenario = {
  displayName: "error",
  responses: [
    {
      startBonusActivationResponse: genericServiceUnavailable,
      getBonusActivationResponseById: genericServiceUnavailable
    },
    {
      startBonusActivationResponse: startActivationNoToken,
      getBonusActivationResponseById: right(undefined)
    },
    {
      startBonusActivationResponse: genericDecodingFailure,
      getBonusActivationResponseById: right(undefined)
    },
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: genericServiceUnavailable
    },
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: getActivationNoToken
    },
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: getActivationNoBonusFound
    },
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: genericDecodingFailure
    },
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: getActivationSuccessBonusError
    }
  ],
  expectedActions: [],
  finalState: {
    activation: { status: BonusActivationProgressEnum.ERROR },
    allActive: {}
  }
};

export const backendIntegrationTestCases: ReadonlyArray<MockBackendScenario> = [
  success,
  eligibilityExpired,
  bonusAlreadyExists,
  timeout,
  error
];

test.skip("mockDataOnlyFile", () => undefined);
