/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret, StateValue } from "xstate";
import { ConfigurationMode } from "../context";
import { InitiativeFailureType } from "../failure";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import { mockActions } from "../__mocks__/actions";
import {
  mockServices,
  T_INITIATIVE_ID,
  T_INSTRUMENT_ID,
  T_NOT_REFUNDABLE_INITIATIVE_DTO,
  T_PAGOPA_INSTRUMENTS
} from "../__mocks__/services";

describe("IDPay configuration machine in INSTRUMENTS mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow the citizen to enroll/delete an Instrument to the initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadInstruments.mockImplementation(async () =>
      Promise.resolve({
        pagoPAInstruments: T_PAGOPA_INSTRUMENTS,
        idPayInstruments: []
      })
    );

    mockServices.enrollInstrument.mockImplementation(async () =>
      Promise.resolve([])
    );

    mockServices.deleteInstrument.mockImplementation(async () =>
      Promise.resolve([])
    );

    const machine = createIDPayInitiativeConfigurationMachine().withConfig({
      services: mockServices,
      actions: mockActions
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
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockServices.enrollInstrument).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "DELETE_INSTRUMENT",
      instrumentId: T_INSTRUMENT_ID
    });

    await waitFor(() =>
      expect(mockServices.deleteInstrument).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ADD_PAYMENT_METHOD"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToAddPaymentMethodScreen
      ).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    service.send({
      type: "NEXT"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(
        mockActions.navigateToInitiativeDetailScreen
      ).toHaveBeenCalledTimes(1)
    );
  });

  it("should exit configuration on BACK event", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadInstruments.mockImplementation(async () =>
      Promise.resolve({
        pagoPAInstruments: T_PAGOPA_INSTRUMENTS,
        idPayInstruments: []
      })
    );

    const machine = createIDPayInitiativeConfigurationMachine().withConfig({
      services: mockServices,
      actions: mockActions
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
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: "DISPLAYING_INSTRUMENTS"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");

    await waitFor(() =>
      expect(mockActions.exitConfiguration).toHaveBeenCalledTimes(1)
    );
  });

  it("should go to CONFIGURATION_FAILURE if instrument list fails to load", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadInstruments.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE)
    );

    const machine = createIDPayInitiativeConfigurationMachine().withConfig({
      services: mockServices,
      actions: mockActions
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
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("CONFIGURATION_FAILURE");
  });
});
