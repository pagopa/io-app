/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret, StateValue } from "xstate";
import { ConfigurationMode } from "../context";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import {
  mockActions,
  mockExitConfiguration,
  mockNavigateToAddPaymentMethodScreen,
  mockNavigateToConfigurationIntro,
  mockNavigateToConfigurationSuccessScreen,
  mockNavigateToIbanEnrollmentScreen,
  mockNavigateToIbanLandingScreen,
  mockNavigateToIbanOnboardingScreen,
  mockNavigateToInitiativeDetailScreen,
  mockNavigateToInstrumentsEnrollmentScreen
} from "../__mocks__/actions";
import {
  mockConfirmIbanSuccess,
  mockDeleteInstrumentSuccess,
  mockEnrollIbanSuccess,
  mockEnrollInstrumentSuccess,
  mockLoadIbanListSuccess,
  mockLoadIbanListSuccessEmpty,
  mockLoadInitiativeSuccessNotRefundable,
  mockLoadInitiativeSuccessRefundable,
  mockLoadInstrumentsSuccess,
  mockLoadInstrumentsSuccessEmpty,
  mockServices,
  MockServicesType,
  T_IBAN,
  T_INITIATIVE_ID,
  T_INSTRUMENT_ID
} from "../__mocks__/services";

describe("IDPay configuration machine in COMPLETE mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have the default state of WAITING_START", () => {
    const machine = createIDPayInitiativeConfigurationMachine();
    expect(machine.initialState.value).toEqual("WAITING_START");
  });

  it("should not allow the citizen to configure an initiative if it's already configured", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessRefundable
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockNavigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("CONFIGURATION_NOT_NEEDED");

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow the citizen to configure an initiative", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessNotRefundable,
        loadIbanList: mockLoadIbanListSuccess,
        enrollIban: mockEnrollIbanSuccess,
        loadInstruments: mockLoadInstrumentsSuccess,
        enrollInstrument: mockEnrollInstrumentSuccess,
        deleteInstrument: mockDeleteInstrumentSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockNavigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockLoadIbanListSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(mockLoadInstrumentsSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockEnrollInstrumentSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "DELETE_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockDeleteInstrumentSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "NEXT"
    });

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    await waitFor(() =>
      expect(mockNavigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow a citizen without any IBAN to configure an initiative", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessNotRefundable,
        loadIbanList: mockLoadIbanListSuccessEmpty,
        confirmIban: mockConfirmIbanSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockNavigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockLoadIbanListSuccessEmpty).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanLandingScreen).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING_FORM"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanOnboardingScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "CONFIRM_IBAN",
      ibanBody: {
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() =>
      expect(mockConfirmIbanSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "LOADING_INSTRUMENTS"
    });

    // From here same as previous test case
  });

  it("should allow a citizen without any instrument to configure an initiative", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessNotRefundable,
        loadIbanList: mockLoadIbanListSuccess,
        enrollIban: mockEnrollIbanSuccess,
        loadInstruments: mockLoadInstrumentsSuccessEmpty,
        enrollInstrument: mockEnrollInstrumentSuccess,
        deleteInstrument: mockDeleteInstrumentSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockNavigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockLoadIbanListSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(mockLoadInstrumentsSuccessEmpty).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    service.send({
      type: "ADD_PAYMENT_METHOD"
    });

    await waitFor(() =>
      expect(mockNavigateToAddPaymentMethodScreen).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow the citizen to configure an initiative skipping the instrument step", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessNotRefundable,
        loadIbanList: mockLoadIbanListSuccess,
        enrollIban: mockEnrollIbanSuccess,
        loadInstruments: mockLoadInstrumentsSuccess,
        enrollInstrument: mockEnrollInstrumentSuccess,
        deleteInstrument: mockDeleteInstrumentSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockNavigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockLoadIbanListSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(mockLoadInstrumentsSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "SKIP"
    });

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    await waitFor(() =>
      expect(mockNavigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });
});

describe("IDPay configuration machine in IBAN mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have the default state of WAITING_START", () => {
    const machine = createIDPayInitiativeConfigurationMachine();
    expect(machine.initialState.value).toEqual("WAITING_START");
  });

  it("should allow the citizen to enroll an IBAN to the initiative", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessRefundable,
        loadIbanList: mockLoadIbanListSuccess,
        enrollIban: mockEnrollIbanSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockLoadIbanListSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalledTimes(1));

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should exit configuration on BACK event", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessRefundable,
        loadIbanList: mockLoadIbanListSuccess,
        enrollIban: mockEnrollIbanSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    await waitFor(() =>
      expect(mockLoadIbanListSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockNavigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");

    await waitFor(() => expect(mockExitConfiguration).toHaveBeenCalledTimes(1));
  });
});

describe("IDPay configuration machine in INSTRUMENTS mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have the default state of WAITING_START", () => {
    const machine = createIDPayInitiativeConfigurationMachine();
    expect(machine.initialState.value).toEqual("WAITING_START");
  });

  it("should allow the citizen to enroll/delete an Instrument to the initiative", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessRefundable,
        loadInstruments: mockLoadInstrumentsSuccess,
        enrollInstrument: mockEnrollInstrumentSuccess,
        deleteInstrument: mockDeleteInstrumentSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toMatch("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.INSTRUMENTS
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockLoadInstrumentsSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockEnrollInstrumentSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "DELETE_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockDeleteInstrumentSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "NEXT"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(mockNavigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should exit configuration on BACK event", async () => {
    const machine = configureMockMachine({
      services: {
        loadInitiative: mockLoadInitiativeSuccessRefundable,
        loadInstruments: mockLoadInstrumentsSuccess
      }
    });

    let currentState: StateValue = machine.initialState.value;

    const service = interpret(machine).onTransition(state => {
      currentState = state.value;
    });

    service.start();

    expect(currentState).toMatch("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.INSTRUMENTS
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockLoadInstrumentsSuccess).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(mockNavigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");

    await waitFor(() => expect(mockExitConfiguration).toHaveBeenCalledTimes(1));
  });
});

type MockMachineConfigType = {
  services?: Partial<MockServicesType>;
};

const configureMockMachine = (config?: MockMachineConfigType) =>
  createIDPayInitiativeConfigurationMachine().withConfig({
    services: {
      ...mockServices,
      ...config?.services
    },
    actions: mockActions
  });
