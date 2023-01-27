/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret, StateValue } from "xstate";
import { ConfigurationMode } from "../context";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import { mockActions, MockActionsType } from "../__mocks__/actions";
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    expect(currentState).toMatch("CONFIGURATION_NOT_NEEDED");
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalled()
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    service.send({ type: "NEXT" });

    await waitFor(() => expect(mockLoadIbanListSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalled());

    await waitFor(() => expect(mockLoadInstrumentsSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() => expect(mockEnrollInstrumentSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "DELETE_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() => expect(mockDeleteInstrumentSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "NEXT"
    });

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");
  });

  it("should allow the citizen to configure an initiative (without IBANs)", async () => {
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessNotRefundable).toHaveBeenCalled()
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockLoadIbanListSuccessEmpty).toHaveBeenCalled()
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING"
    });

    service.send({ type: "NEXT" });

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING_FORM"
    });

    service.send({
      type: "CONFIRM_IBAN",
      ibanBody: {
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockConfirmIbanSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "LOADING_INSTRUMENTS"
    });

    // From here same as previous test case
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockLoadIbanListSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    service.send({
      type: "ENROLL_IBAN",
      iban: {
        channel: "IO",
        checkIbanStatus: "",
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(mockEnrollIbanSuccess).toHaveBeenCalled());

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockLoadIbanListSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.INSTRUMENTS
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockLoadInstrumentsSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() => expect(mockEnrollInstrumentSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "DELETE_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() => expect(mockDeleteInstrumentSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "NEXT"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");
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

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.INSTRUMENTS
    });

    await waitFor(() =>
      expect(mockLoadInitiativeSuccessRefundable).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockLoadInstrumentsSuccess).toHaveBeenCalled());

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");
  });
});

type MockMachineConfigType = {
  services?: Partial<MockServicesType>;
  actions?: Partial<MockActionsType>;
};

const configureMockMachine = (config?: MockMachineConfigType) =>
  createIDPayInitiativeConfigurationMachine().withConfig({
    services: {
      ...mockServices,
      ...config?.services
    },
    actions: {
      ...mockActions,
      ...config?.actions
    }
  });
