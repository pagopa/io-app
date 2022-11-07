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

const T_SERVICE_ID = "T_SERVICE_ID";
const T_INITIATIVE_ID = "T_INITIATIVE_ID";

const T_REQUIRED_PDND_CRITERIA: PDNDCriteriaDTO = {
  code: "T_CODE_PDBD",
  description: "T_DESCRIPTION",
  authority: "T_AUTHORITY"
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

const mockAcceptTos = jest.fn(async (): Promise<undefined> => undefined);

const mockLoadRequiredCriteria = jest.fn(
  async (): Promise<O.Option<RequiredCriteriaDTO>> =>
    O.some(T_REQUIRED_CRITERIA)
);

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
        acceptTos: mockAcceptTos,
        loadRequiredCriteria: mockLoadRequiredCriteria,
        acceptRequiredCriteria: mockAcceptRequiredCriteria
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send({
      type: "SELECT_INITIATIVE",
      serviceId: T_SERVICE_ID
    });

    await waitFor(() =>
      expect(mockLoadInitiative).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: T_SERVICE_ID
        }),
        expect.anything(),
        expect.anything()
      )
    );

    onboardingService.send({
      type: "ACCEPT_TOS"
    });

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

    onboardingService.send({
      type: "ACCEPT_REQUIRED_PDND_CRITERIA"
    });

    onboardingService.send({
      type: "ACCEPT_REQUIRED_SELF_CRITERIA"
    });

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
});
