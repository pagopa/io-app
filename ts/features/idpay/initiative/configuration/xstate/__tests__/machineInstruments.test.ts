/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret, StateValue } from "xstate";
import { ConfigurationMode } from "../context";
import { InitiativeFailureType } from "../failure";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import { mockActions } from "../__mocks__/actions";
import {
  mockDeleteInstrument,
  mockEnrollInstrument,
  mockServices,
  T_INITIATIVE_ID,
  T_INSTRUMENT_DTO,
  T_NOT_REFUNDABLE_INITIATIVE_DTO,
  T_PAGOPA_INSTRUMENTS,
  T_WALLET
} from "../__mocks__/services";

describe("IDPay configuration machine in INSTRUMENTS mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow the citizen to enroll/delete an Instrument to the initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    mockServices.loadInitiativeInstruments.mockImplementation(async () =>
      Promise.resolve([])
    );

    mockEnrollInstrument.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockDeleteInstrument.mockImplementation(async () =>
      Promise.resolve(undefined)
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
      expect(mockServices.loadWalletInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "ENROLL_INSTRUMENT",
      instrument: T_WALLET
    });

    await waitFor(() => expect(mockEnrollInstrument).toHaveBeenCalledTimes(1));

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "DELETE_INSTRUMENT",
      instrument: T_INSTRUMENT_DTO
    });

    await waitFor(() => expect(mockDeleteInstrument).toHaveBeenCalledTimes(1));

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
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
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
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

    mockServices.loadWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    mockServices.loadInitiativeInstruments.mockImplementation(async () =>
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
      expect(mockServices.loadWalletInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
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

    mockServices.loadWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    mockServices.loadInitiativeInstruments.mockImplementation(async () =>
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
      expect(mockServices.loadWalletInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("CONFIGURATION_FAILURE");
  });
});
