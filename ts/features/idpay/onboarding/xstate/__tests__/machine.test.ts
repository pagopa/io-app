import { interpret } from "xstate";
import { waitFor } from "@testing-library/react-native";
import { InitiativeDto } from "../../../../../../definitions/idpay/onboarding/InitiativeDto";
import { createIDPayOnboardingMachine } from "../machine";

const T_SERVICE_ID = "T_SERVICE_ID";
const T_INITIATIVE_ID = "T_INITIATIVE_ID";

const mockLoadInitiative = jest.fn(
  async (): Promise<InitiativeDto> => ({
    initiativeId: T_INITIATIVE_ID
  })
);

const mockAcceptTos = jest.fn(async (): Promise<undefined> => undefined);

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
        acceptTos: mockAcceptTos
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() => expect(mockLoadInitiative).toHaveBeenCalled());

    onboardingService.send({
      type: "ACCEPT_TOS"
    });

    await waitFor(() => expect(mockAcceptTos).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("LOADING_REQUIRED_CRITERIA")
    ).toBeTruthy();
  });
});
