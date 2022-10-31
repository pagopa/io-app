import { interpret } from "xstate";
import { waitFor } from "@testing-library/react-native";
import {
  createIDPayOnboardingMachine} from "../machine";
import { InitiativeDto } from "../../../../../../definitions/idpay/onboarding/InitiativeDto";
import { RequiredCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { _typeEnum as teSelfBool } from "../../../../../../definitions/idpay/onboarding/SelfConsentBoolDTO";
import { PDNDCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/PDNDCriteriaDTO";
import { SelfDeclarationDTO } from "../../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";

const T_SERVICE_ID = "T_SERVICE_ID";
const T_INITIATIVE_ID = "T_INITIATIVE_ID";

const T_REQUIRED_PDND_CRITERIA: PDNDCriteriaDTO = {
  code: "T_CODE",
  description: "T_DESCRIPTION",
  authority: "T_AUTHORITY"
};

const T_REQUIRED_SELF_CRITERIA: SelfDeclarationDTO = {
  _type: teSelfBool.boolean,
  code: "T_CODE",
  description: "T_DESCRIPTION",
  value: true
};

const mockLoadInitiative = jest.fn(
  async (): Promise<InitiativeDto> => ({
    initiativeId: T_INITIATIVE_ID
  })
);

const mockAcceptTos = jest.fn(async () => undefined);

const mockLoadRequiredCriteria = jest.fn(
  async (): Promise<RequiredCriteriaDTO> => ({
    pdndCriteria: [T_REQUIRED_PDND_CRITERIA],
    selfDeclarationList: [T_REQUIRED_SELF_CRITERIA]
  })
);

const mockAcceptRequiredCritera = jest.fn(async () => undefined);

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
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteria,
        acceptRequiredCriteria: mockAcceptRequiredCritera
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(mockAcceptTos).toHaveBeenCalled());

    await waitFor(() => expect(mockLoadRequiredCriteria).toHaveBeenCalled());

    onboardingService.send("ACCEPT_REQUIRED_PDND_CRITERIA");

    onboardingService.send("ACCEPT_REQUIRED_SELF_CRITERIA");

    await waitFor(() => expect(mockAcceptRequiredCritera).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should not display PDND prerequisite is not needed", async () => {
    const mockLoadRequiredCriteriaWithoutPDND = jest.fn(async () => ({
      pdndCriteria: [],
      selfDeclarationList: [T_REQUIRED_SELF_CRITERIA]
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteriaWithoutPDND,
        acceptRequiredCriteria: mockAcceptRequiredCritera
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (state.matches("DISPLAYING_REQUIRED_PDND_CRITERIA")) {
        fail("PDND prerequisite should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(mockAcceptTos).toHaveBeenCalled());

    onboardingService.send("ACCEPT_REQUIRED_SELF_CRITERIA");

    await waitFor(() => expect(mockAcceptRequiredCritera).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should not display SELF prerequisite is not needed", async () => {
    const mockLoadRequiredCriteriaWithoutSELF = jest.fn(async () => ({
      pdndCriteria: [T_REQUIRED_PDND_CRITERIA],
      selfDeclarationList: []
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteriaWithoutSELF,
        acceptRequiredCriteria: mockAcceptRequiredCritera
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (state.matches("DISPLAYING_REQUIRED_SELF_CRITERIA")) {
        fail("SELF criteria should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(mockAcceptTos).toHaveBeenCalled());

    onboardingService.send("ACCEPT_REQUIRED_PDND_CRITERIA");

    await waitFor(() => expect(mockAcceptRequiredCritera).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should skip all the criteria steps if not needed", async () => {
    const mockLoadRequiredCriteriaNO = jest.fn(async () => ({
      pdndCriteria: [],
      selfDeclarationList: []
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      services: {
        loadInitiative: mockLoadInitiative,
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteriaNO,
        acceptRequiredCriteria: mockAcceptRequiredCritera
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (
        state.matches(
          "DISPLAYING_REQUIRED_PDND_CRITERIA" ||
            "DISPLAYING_REQUIRED_SELF_CRITERIA" ||
            "ACCEPTING_REQUIRED_CRITERIA"
        )
      ) {
        fail("all criteria steps should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(mockAcceptTos).toHaveBeenCalled());

    await waitFor(() => expect(mockAcceptRequiredCritera).not.toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });
});
