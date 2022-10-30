import { assign, interpret, MachineOptionsFrom } from "xstate";
import { waitFor } from "@testing-library/react-native";
import {
  createIDPayOnboardingMachine,
  OnboardingMachineType
} from "../machine";

const T_SERVICE_ID = "T_SERVICE_ID";
const T_INITIATIVE_ID = "T_INITIATIVE_ID";

const fakeLoadInitiativeData = jest.fn(async () => ({
  initiativeId: T_INITIATIVE_ID
}));

const fakeAcceptTos = jest.fn(async () => undefined);

const fakeLoadPrerequisites = jest.fn(async () => ({
  pdnd: true,
  self: true
}));

const fakeAcceptPrerequisites = jest.fn(async () => undefined);

const DEFAULT_ACTIONS: MachineOptionsFrom<OnboardingMachineType>["actions"] = {
  selectInitiative: assign((_, event) => ({
    serviceId: event.serviceId
  })),
  loadInitiativeDataSuccess: assign((_, event) => ({
    initiativeId: event.data.initiativeId
  })),
  loadPrerequisitesSuccess: assign((_, event) => ({
    prerequisites: {
      pdnd: event.data.pdnd,
      self: event.data.self
    }
  }))
};

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
      actions: {
        selectInitiative: DEFAULT_ACTIONS.selectInitiative,
        loadInitiativeDataSuccess: DEFAULT_ACTIONS.loadInitiativeDataSuccess,
        loadPrerequisitesSuccess: DEFAULT_ACTIONS.loadPrerequisitesSuccess
      },
      services: {
        loadInitiativeData: fakeLoadInitiativeData,
        acceptTos: fakeAcceptTos,
        loadPrerequisites: fakeLoadPrerequisites,
        acceptPrerequisites: fakeAcceptPrerequisites
      },
      guards: {
        hasPDNDPrerequisites: context => !!context.prerequisites?.pdnd,
        hasSelfPrerequisites: context => !!context.prerequisites?.self
      }
    });

    const onboardingService = interpret(machine);

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(fakeLoadInitiativeData).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(fakeAcceptTos).toHaveBeenCalled());

    onboardingService.send("ACCEPT_PDND_PREREQUISITES");

    await waitFor(() => expect(fakeLoadPrerequisites).toHaveBeenCalled());

    onboardingService.send("ACCEPT_SELF_PREREQUISITES");

    await waitFor(() => expect(fakeAcceptPrerequisites).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should not display PDND prerequisite is not needed", async () => {
    const fakeLoadPrerequisitesWithoutPDND = jest.fn(async () => ({
      pdnd: false,
      self: true
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      actions: {
        selectInitiative: DEFAULT_ACTIONS.selectInitiative,
        loadInitiativeDataSuccess: DEFAULT_ACTIONS.loadInitiativeDataSuccess,
        loadPrerequisitesSuccess: DEFAULT_ACTIONS.loadPrerequisitesSuccess
      },
      services: {
        loadInitiativeData: fakeLoadInitiativeData,
        acceptTos: fakeAcceptTos,
        loadPrerequisites: fakeLoadPrerequisitesWithoutPDND,
        acceptPrerequisites: fakeAcceptPrerequisites
      },
      guards: {
        hasPDNDPrerequisites: context => !!context.prerequisites?.pdnd,
        hasSelfPrerequisites: context => !!context.prerequisites?.self
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (state.matches("DISPLAYING_PDND_PREREQUISITES")) {
        fail("PDND prerequisite should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(fakeLoadInitiativeData).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(fakeAcceptTos).toHaveBeenCalled());

    onboardingService.send("ACCEPT_SELF_PREREQUISITES");

    await waitFor(() => expect(fakeAcceptPrerequisites).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should not display SELF prerequisite is not needed", async () => {
    const fakeLoadPrerequisitesWithoutSELF = jest.fn(async () => ({
      pdnd: true,
      self: false
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      actions: {
        selectInitiative: DEFAULT_ACTIONS.selectInitiative,
        loadInitiativeDataSuccess: DEFAULT_ACTIONS.loadInitiativeDataSuccess,
        loadPrerequisitesSuccess: DEFAULT_ACTIONS.loadPrerequisitesSuccess
      },
      services: {
        loadInitiativeData: fakeLoadInitiativeData,
        acceptTos: fakeAcceptTos,
        loadPrerequisites: fakeLoadPrerequisitesWithoutSELF,
        acceptPrerequisites: fakeAcceptPrerequisites
      },
      guards: {
        hasPDNDPrerequisites: context => !!context.prerequisites?.pdnd,
        hasSelfPrerequisites: context => !!context.prerequisites?.self
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (state.matches("DISPLAYING_SELF_PREREQUISITES")) {
        fail("SELF prerequisite should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(fakeLoadInitiativeData).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(fakeAcceptTos).toHaveBeenCalled());

    onboardingService.send("ACCEPT_PDND_PREREQUISITES");

    await waitFor(() => expect(fakeAcceptPrerequisites).toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });

  it("should skip all the prerequisites steps if not needed", async () => {
    const fakeLoadPrerequisitesNO = jest.fn(async () => ({
      pdnd: false,
      self: false
    }));

    const machine = createIDPayOnboardingMachine().withConfig({
      actions: {
        selectInitiative: DEFAULT_ACTIONS.selectInitiative,
        loadInitiativeDataSuccess: DEFAULT_ACTIONS.loadInitiativeDataSuccess,
        loadPrerequisitesSuccess: DEFAULT_ACTIONS.loadPrerequisitesSuccess
      },
      services: {
        loadInitiativeData: fakeLoadInitiativeData,
        acceptTos: fakeAcceptTos,
        loadPrerequisites: fakeLoadPrerequisitesNO,
        acceptPrerequisites: fakeAcceptPrerequisites
      },
      guards: {
        hasPDNDPrerequisites: context => !!context.prerequisites?.pdnd,
        hasSelfPrerequisites: context => !!context.prerequisites?.self
      }
    });

    const onboardingService = interpret(machine).onTransition(state => {
      if (
        state.matches(
          "DISPLAYING_PDND_PREREQUISITES" ||
            "DISPLAYING_SELF_PREREQUISITES" ||
            "ACCEPTING_PREREQUISITES"
        )
      ) {
        fail("SELF prerequisite should not be displayed");
      }
    });

    onboardingService.start();

    onboardingService.send("SELECT_INITIATIVE", { serviceId: T_SERVICE_ID });

    await waitFor(() => expect(fakeLoadInitiativeData).toHaveBeenCalled());

    onboardingService.send("ACCEPT_TOS");

    await waitFor(() => expect(fakeAcceptTos).toHaveBeenCalled());

    await waitFor(() => expect(fakeAcceptPrerequisites).not.toHaveBeenCalled());

    expect(
      onboardingService.getSnapshot().matches("DISPLAYING_ONBOARDING_COMPLETED")
    );
  });
});
