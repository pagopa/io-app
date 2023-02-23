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
  T_IBAN,
  T_IBAN_LIST,
  T_INITIATIVE_ID,
  T_NOT_REFUNDABLE_INITIATIVE_DTO
} from "../__mocks__/services";

describe("IDPay configuration machine in IBAN mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow the citizen to enroll an IBAN to the initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(
        1
      )
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

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockActions.showUpdateIbanToast).toHaveBeenCalledTimes(1)
    );
  });

  it("should exit configuration on BACK event", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() => expect(mockServices.loadInitiative).toHaveBeenCalled());

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(
        1
      )
    );

    service.send({
      type: "BACK"
    });

    expect(currentState).toMatch("CONFIGURATION_CLOSED");

    await waitFor(() =>
      expect(mockActions.exitConfiguration).toHaveBeenCalledTimes(1)
    );
  });

  it("should go to CONFIGURATION_FAILURE if IBAN list fails to load", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE)
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.IBAN
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("CONFIGURATION_FAILURE");
  });
});
