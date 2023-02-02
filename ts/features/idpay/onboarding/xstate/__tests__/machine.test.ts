import * as O from "fp-ts/lib/Option";
import { interpret } from "xstate";
import { waitFor } from "@testing-library/react-native";
import { InitiativeDto } from "../../../../../../definitions/idpay/onboarding/InitiativeDto";
import { createIDPayOnboardingMachine } from "../machine";
import { RequiredCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { PDNDCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/PDNDCriteriaDTO";
import {
  SelfDeclarationBoolDTO,
  _typeEnum as SelfDeclarationBoolDTOType
} from "../../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as SelfDeclarationMultiDTOType
} from "../../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { StatusEnum } from "../../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";

const T_SERVICE_ID = "T_SERVICE_ID";
const T_INITIATIVE_ID = "T_INITIATIVE_ID";

const T_REQUIRED_PDND_CRITERIA: PDNDCriteriaDTO = {
  code: "T_CODE_PDBD",
  description: "T_DESCRIPTION",
  authority: "T_AUTHORITY",
  value: "T_VALUE"
};

const T_REQUIRED_SELF_CRITERIA_BOOL: SelfDeclarationBoolDTO = {
  _type: SelfDeclarationBoolDTOType.boolean,
  code: "T_CODE_SELF_BOOL",
  description: "T_DESCRIPTION",
  value: true
};

const T_REQUIRED_SELF_CRITERIA_MULTI: SelfDeclarationMultiDTO = {
  _type: SelfDeclarationMultiDTOType.multi,
  code: "T_CODE_SELF_MULTI",
  description: "T_DESCRIPTION",
  value: ["T_VALUE_1", "T_VALUE_2"]
};

const T_REQUIRED_CRITERIA: RequiredCriteriaDTO = {
  pdndCriteria: [T_REQUIRED_PDND_CRITERIA],
  selfDeclarationList: [
    T_REQUIRED_SELF_CRITERIA_BOOL,
    T_REQUIRED_SELF_CRITERIA_MULTI
  ]
};

const mockLoadInitiative = jest.fn(
  async (): Promise<InitiativeDto> => ({
    initiativeId: T_INITIATIVE_ID
  })
);

const mockLoadInitiativeStatus = jest.fn(
  async (): Promise<O.Option<StatusEnum>> => O.none
);

const mockAcceptTos = jest.fn(async (): Promise<undefined> => undefined);

const mockLoadRequiredCriteria = jest.fn(
  async (): Promise<O.Option<RequiredCriteriaDTO>> =>
    O.some(T_REQUIRED_CRITERIA)
);

const mockNavigateToInitiativeDetailsScreen = jest.fn();
const mockNavigateToPDNDCriteriaScreen = jest.fn();
const mockNavigateToSelfDeclarationsScreen = jest.fn();
const mockNavigateToCompletionScreen = jest.fn();
const mockNavigateToFailureScreen = jest.fn();
const mockNavigateToInitiativeMonitoringScreen = jest.fn();
const mockExitOnboarding = jest.fn();

const mockAcceptRequiredCriteria = jest.fn(
  async (): Promise<undefined> => undefined
);

describe("machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have a default state of WAITING_INITIATIVE_SELECTION", () => {
    const machine = createIDPayOnboardingMachine();
    expect(machine.initialState.value).toEqual("WAITING_INITIATIVE_SELECTION");
  });

  it("should allow the citizen to complete onboarding on happy path", async () => {
    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        loadInitiativeStatus: mockLoadInitiativeStatus,
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteria,
        acceptRequiredCriteria: mockAcceptRequiredCriteria
      },
      actions: {
        navigateToInitiativeDetailsScreen:
          mockNavigateToInitiativeDetailsScreen,
        navigateToPDNDCriteriaScreen: mockNavigateToPDNDCriteriaScreen,
        navigateToSelfDeclarationsScreen: mockNavigateToSelfDeclarationsScreen,
        navigateToCompletionScreen: mockNavigateToCompletionScreen,
        navigateToFailureScreen: mockNavigateToFailureScreen,
        navigateToInitiativeMonitoringScreen: jest.fn(),
        exitOnboarding: mockExitOnboarding
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    expect(
      onboardingService.getSnapshot().matches("LOADING_INITIATIVE")
    ).toBeTruthy();

    await waitFor(() =>
      expect(mockLoadInitiative).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(mockLoadInitiativeStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          initiative: {
            initiativeId: T_INITIATIVE_ID
          },
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_INITIATIVE")
    ).toBeTruthy();

    onboardingService.send({
      type: "ACCEPT_TOS"
    });

    expect(
      onboardingService.getSnapshot().matches("ACCEPTING_TOS")
    ).toBeTruthy();

    await waitFor(() =>
      expect(mockAcceptTos).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(mockLoadRequiredCriteria).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID,
          initiative: {
            initiativeId: T_INITIATIVE_ID
          }
        }),
        expect.anything(),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(mockNavigateToPDNDCriteriaScreen).toHaveBeenCalled()
    );

    onboardingService.send({
      type: "ACCEPT_REQUIRED_PDND_CRITERIA"
    });

    await waitFor(() =>
      expect(mockNavigateToSelfDeclarationsScreen).toHaveBeenCalled()
    );

    onboardingService.send({
      type: "ACCEPT_REQUIRED_SELF_CRITERIA"
    });

    await waitFor(() =>
      expect(mockNavigateToCompletionScreen).toHaveBeenCalled()
    );

    await waitFor(() =>
      expect(mockAcceptRequiredCriteria).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID,
          initiative: {
            initiativeId: T_INITIATIVE_ID
          },
          requiredCriteria: O.some(T_REQUIRED_CRITERIA)
        }),
        expect.anything(),
        expect.anything()
      )
    );

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    ).toBeTruthy();
  });

  it("should allow the citizen to exit onboarding from any state", async () => {
    const mockExitOnboarding = jest.fn();

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: jest.fn(),
        loadInitiativeStatus: jest.fn(),
        acceptTos: jest.fn(),
        loadRequiredCriteria: jest.fn(),
        acceptRequiredCriteria: jest.fn()
      },
      actions: {
        navigateToInitiativeDetailsScreen: jest.fn(),
        navigateToPDNDCriteriaScreen: jest.fn(),
        navigateToSelfDeclarationsScreen: jest.fn(),
        navigateToCompletionScreen: jest.fn(),
        navigateToFailureScreen: jest.fn(),
        navigateToInitiativeMonitoringScreen: jest.fn(),
        exitOnboarding: mockExitOnboarding
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "QUIT_ONBOARDING"
    });

    await waitFor(() => expect(mockExitOnboarding).toHaveBeenCalled());
  });

  it("should not allow the citizen to complete the onboarding multiple times", async () => {
    const mockLoadInitiativeStatus = jest.fn(async () =>
      O.some(StatusEnum.ONBOARDING_OK)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        loadInitiativeStatus: mockLoadInitiativeStatus,
        acceptTos: jest.fn(),
        loadRequiredCriteria: jest.fn(),
        acceptRequiredCriteria: jest.fn()
      },
      actions: {
        navigateToInitiativeDetailsScreen: jest.fn(),
        navigateToPDNDCriteriaScreen: jest.fn(),
        navigateToSelfDeclarationsScreen: jest.fn(),
        navigateToCompletionScreen: jest.fn(),
        navigateToFailureScreen: mockNavigateToFailureScreen,
        navigateToInitiativeMonitoringScreen: jest.fn(),
        exitOnboarding: jest.fn()
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_FAILURE")
    ).toBeTruthy();
  });

  it("should not allow the citizen to complete the onboarding if rejected", async () => {
    const mockLoadInitiativeStatus = jest.fn(async () =>
      O.some(StatusEnum.ONBOARDING_KO)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        loadInitiativeStatus: mockLoadInitiativeStatus,
        acceptTos: jest.fn(),
        loadRequiredCriteria: jest.fn(),
        acceptRequiredCriteria: jest.fn()
      },
      actions: {
        navigateToInitiativeDetailsScreen: jest.fn(),
        navigateToPDNDCriteriaScreen: jest.fn(),
        navigateToSelfDeclarationsScreen: jest.fn(),
        navigateToCompletionScreen: jest.fn(),
        navigateToFailureScreen: mockNavigateToFailureScreen,
        navigateToInitiativeMonitoringScreen: jest.fn(),
        exitOnboarding: jest.fn()
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_FAILURE")
    ).toBeTruthy();
  });
});
