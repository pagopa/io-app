/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import { interpret } from "xstate";
import { PDNDCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/PDNDCriteriaDTO";
import { RequiredCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfConsentMultiDTO } from "../../../../../../definitions/idpay/onboarding/SelfConsentMultiDTO";
import {
  SelfDeclarationBoolDTO,
  _typeEnum as SelfDeclarationBoolDTOType
} from "../../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as SelfDeclarationMultiDTOType
} from "../../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { OnboardingFailureEnum } from "../failure";
import { createIDPayOnboardingMachine } from "../machine";
import { mockActions } from "../__mocks__/actions";
import { mockServices } from "../__mocks__/services";

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

const T_SELF_CONSENT_MULTI: SelfConsentMultiDTO = {
  _type: SelfDeclarationMultiDTOType.multi,
  code: "T_CODE_SELF_MULTI",
  value: "T_VALUE_1"
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

describe("IDPay Onboarding machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have a default state of WAITING_INITIATIVE_SELECTION", () => {
    const machine = createIDPayOnboardingMachine();
    expect(machine.initialState.value).toEqual("WAITING_INITIATIVE_SELECTION");
  });

  it("should allow the citizen to complete onboarding on happy path", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve({
        initiativeId: T_INITIATIVE_ID
      })
    );

    mockServices.loadInitiativeStatus.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.acceptTos.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.loadRequiredCriteria.mockImplementation(async () =>
      Promise.resolve(O.some(T_REQUIRED_CRITERIA))
    );

    mockServices.acceptRequiredCriteria.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    service.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    expect(currentState.value).toMatch("LOADING_INITIATIVE");

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeStatus).toHaveBeenCalledWith(
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

    expect(currentState.value).toMatch("DISPLAYING_INITIATIVE");

    service.send({
      type: "ACCEPT_TOS"
    });

    expect(currentState.value).toMatch("ACCEPTING_TOS");

    await waitFor(() =>
      expect(mockServices.acceptTos).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(mockServices.loadRequiredCriteria).toHaveBeenCalledWith(
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
      expect(mockActions.navigateToPDNDCriteriaScreen).toHaveBeenCalled()
    );

    expect(currentState.value).toMatch("DISPLAYING_REQUIRED_PDND_CRITERIA");

    service.send({
      type: "ACCEPT_REQUIRED_PDND_CRITERIA"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToBoolSelfDeclarationsScreen
      ).toHaveBeenCalled()
    );

    expect(currentState.value).toMatchObject({
      DISPLAYING_REQUIRED_SELF_CRITERIA: "DISPLAYING_BOOL_CRITERIA"
    });

    service.send({
      type: "ACCEPT_REQUIRED_BOOL_CRITERIA"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToMultiSelfDeclarationsScreen
      ).toHaveBeenCalled()
    );

    expect(currentState.value).toMatchObject({
      DISPLAYING_REQUIRED_SELF_CRITERIA: "DISPLAYING_MULTI_CRITERIA"
    });

    service.send({
      type: "SELECT_MULTI_CONSENT",
      data: T_SELF_CONSENT_MULTI
    });

    await waitFor(() =>
      expect(mockActions.navigateToCompletionScreen).toHaveBeenCalled()
    );

    await waitFor(() =>
      expect(mockServices.acceptRequiredCriteria).toHaveBeenCalledWith(
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

    expect(currentState.value).toMatch("DISPLAYING_ONBOARDING_COMPLETED");
  });

  it("should allow the citizen to exit onboarding from any state", async () => {
    const machine = createIDPayOnboardingMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    const service = interpret(machine);

    service.start();

    service.send({
      type: "QUIT_ONBOARDING"
    });

    await waitFor(() => expect(mockActions.exitOnboarding).toHaveBeenCalled());
  });

  it("should not allow the citizen to complete the onboarding if initiative fails to load", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.reject(OnboardingFailureEnum.GENERIC)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("WAITING_INITIATIVE_SELECTION");

    service.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockServices.loadInitiative).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockServices.loadInitiativeStatus).toHaveBeenCalledTimes(0)
    );

    expect(currentState.value).toMatch("DISPLAYING_ONBOARDING_FAILURE");
  });

  it("should not allow the citizen to complete the onboarding if initiative status is not valid", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve({
        initiativeId: T_INITIATIVE_ID
      })
    );

    mockServices.loadInitiativeStatus.mockImplementation(async () =>
      Promise.reject(OnboardingFailureEnum.ONBOARDED)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("WAITING_INITIATIVE_SELECTION");

    service.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockServices.loadInitiative).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockServices.loadInitiativeStatus).toHaveBeenCalled()
    );

    expect(currentState.value).toMatch("DISPLAYING_ONBOARDING_FAILURE");
  });

  it("should not allow the citizen to complete the onboarding if prerequesites check fails", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve({
        initiativeId: T_INITIATIVE_ID
      })
    );

    mockServices.loadInitiativeStatus.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.acceptTos.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.loadRequiredCriteria.mockImplementation(async () =>
      Promise.reject(OnboardingFailureEnum.GENERIC)
    );

    const machine = createIDPayOnboardingMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("WAITING_INITIATIVE_SELECTION");

    service.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockServices.loadInitiative).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockServices.loadInitiativeStatus).toHaveBeenCalled()
    );

    expect(currentState.value).toMatch("DISPLAYING_INITIATIVE");

    service.send({
      type: "ACCEPT_TOS"
    });

    await waitFor(() => expect(mockServices.acceptTos).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockServices.loadRequiredCriteria).toHaveBeenCalled()
    );

    expect(currentState.value).toMatch("DISPLAYING_ONBOARDING_FAILURE");
  });
});
