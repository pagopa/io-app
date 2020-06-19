import { ProblemJson } from "italia-ts-commons/lib/responses";
import { InstanceId } from "../../../../../../../../definitions/bonus_vacanze/InstanceId";
import { navigationHistoryPop } from "../../../../../../../store/actions/navigationHistory";
import { mockedBonus } from "../../../../../mock/mockData";
import {
  navigateToBonusActivationCompleted,
  navigateToBonusActiveDetailScreen,
  navigateToBonusAlreadyExists,
  navigateToEligibilityExpired
} from "../../../../../navigation/action";
import { IExpectedActions } from "../mockData";

const genericServiceUnavailable = {
  status: 500,
  value: {
    type: "https://example.com/problem/constraint-violation",
    title: "string",
    status: 500,
    detail: "There was an error processing the request",
    instance: "string"
  } as ProblemJson
};

// mock activation for /bonus/vacanze/activations POST

const startActivationRequestCreated = {
  status: 201,
  value: { id: "bonus_id" } as InstanceId
};
const startActivationEligibilityExpired = { status: 403 };
const startActivationBonusAlreadyExists = { status: 409 };
const startActivationNoToken = { status: 401 };

// mock activation /bonus/vacanze/activations/{bonus_id} GET
const getActivationSuccess = { status: 200, value: mockedBonus };
const getActivationNoToken = {
  status: 401
};
const getActivationNoBonusFound = {
  status: 404
};

export type ActivationBackendResponse = {
  startBonusActivationResponse: any;
  getBonusActivationResponseById: any;
};

interface MockBackendScenario extends IExpectedActions {
  responses: ReadonlyArray<ActivationBackendResponse>;
}

export const success = {
  displayName: "success",
  responses: [
    {
      startBonusActivationResponse: startActivationRequestCreated,
      getBonusActivationResponseById: getActivationSuccess
    }
  ],
  expectedActions: [
    navigateToBonusActivationCompleted(),
    navigateToBonusActiveDetailScreen({ bonus: mockedBonus }),
    navigationHistoryPop(1)
  ]
} as MockBackendScenario;

export const eligibilityExpired = {
  displayName: "eligibility expired",
  responses: [
    {
      startBonusActivationResponse: startActivationEligibilityExpired,
      getBonusActivationResponseById: undefined
    }
  ],
  expectedActions: [navigateToEligibilityExpired(), navigationHistoryPop(1)]
} as MockBackendScenario;

export const bonusAlreadyExists = {
  displayName: "bonus already exists",
  responses: [
    {
      startBonusActivationResponse: startActivationBonusAlreadyExists,
      getBonusActivationResponseById: undefined
    }
  ],
  expectedActions: [navigateToBonusAlreadyExists(), navigationHistoryPop(1)]
} as MockBackendScenario;

export const error = {
  displayName: "error",
  responses: [
    {
      startBonusActivationResponse: genericServiceUnavailable,
      getBonusActivationResponseById: genericServiceUnavailable
    },
    {
      startBonusActivationResponse: startActivationNoToken,
      getBonusActivationResponseById: undefined
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
    }
  ],
  expectedActions: []
} as MockBackendScenario;

export const backendIntegrationTestCases = [
  success,
  eligibilityExpired,
  bonusAlreadyExists,
  error
] as ReadonlyArray<MockBackendScenario>;
