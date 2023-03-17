/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret } from "xstate";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { createIDPayUnsubscriptionMachine } from "../machine";

const T_INITIATIVE_ID = "T_INITIATIVE_ID";
const T_INITIATIVE_NAME = "T_INITIATIVE_ID";

const T_INITIATIVE_DTO: InitiativeDTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.NOT_REFUNDABLE,
  endDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
};

describe("IDPay Unsubscription machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should transition to DISPLAYING_CONFIRMATION after start", () => {
    // NOTE: initial state is START_UNSUBSCRIPTION but since it has an "always" transitions the transition occurs immediately

    const machine = createIDPayUnsubscriptionMachine({
      initiativeId: T_INITIATIVE_ID,
      initiativeName: T_INITIATIVE_NAME
    });

    expect(machine.initialState.value).toEqual("DISPLAYING_CONFIRMATION");
  });

  it("should transition to LOADING_INITIATIVE_INFO after start", () => {
    // NOTE: initial state is START_UNSUBSCRIPTION but since it has an "always" transitions the transition occurs immediately

    const machine = createIDPayUnsubscriptionMachine({
      initiativeId: T_INITIATIVE_ID
    });

    expect(machine.initialState.value).toEqual("LOADING_INITIATIVE_INFO");
  });

  it("should get initiative info if something is missing", async () => {
    const mockGetInitiativeInfo = jest.fn(async () =>
      Promise.resolve(T_INITIATIVE_DTO)
    );

    const machine = createIDPayUnsubscriptionMachine({
      initiativeId: T_INITIATIVE_ID
    }).withConfig({
      actions: {
        navigateToConfirmationScreen: jest.fn(),
        navigateToResultScreen: jest.fn(),
        exitToWallet: jest.fn(),
        exitUnsubscription: jest.fn()
      },
      services: {
        getInitiativeInfo: mockGetInitiativeInfo,
        unsubscribeFromInitiative: jest.fn()
      }
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    await waitFor(() => expect(mockGetInitiativeInfo).toHaveBeenCalled());

    expect(currentState.value).toEqual("DISPLAYING_CONFIRMATION");
  });

  it("should allow the citizen to complete the unsubscription on happy path", async () => {
    const mockUnsubscribeFromInitiative = jest.fn(async () =>
      Promise.resolve(undefined)
    );

    const mockNavigateToConfirmationScreen = jest.fn();
    const mockNavigateToResultScreen = jest.fn();
    const mockExitToWallet = jest.fn();

    const machine = createIDPayUnsubscriptionMachine({
      initiativeId: T_INITIATIVE_ID,
      initiativeName: T_INITIATIVE_NAME
    }).withConfig({
      actions: {
        navigateToConfirmationScreen: mockNavigateToConfirmationScreen,
        navigateToResultScreen: mockNavigateToResultScreen,
        exitToWallet: mockExitToWallet,
        exitUnsubscription: jest.fn()
      },
      services: {
        getInitiativeInfo: jest.fn(),
        unsubscribeFromInitiative: mockUnsubscribeFromInitiative
      }
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    await waitFor(() =>
      expect(mockNavigateToConfirmationScreen).toHaveBeenCalled()
    );

    expect(currentState.value).toEqual("DISPLAYING_CONFIRMATION");

    service.send({
      type: "CONFIRM_UNSUBSCRIPTION"
    });

    expect(currentState.value).toEqual("UNSUBSCRIBING");

    await waitFor(() =>
      expect(mockUnsubscribeFromInitiative).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockNavigateToResultScreen).toHaveBeenCalled());

    expect(currentState.value).toEqual("UNSUBSCRIPTION_SUCCESS");

    service.send({
      type: "EXIT"
    });

    await waitFor(() => expect(mockExitToWallet).toHaveBeenCalled());
  });

  it("should show failure if unsubscription fails", async () => {
    const mockUnsubscribeFromInitiative = jest.fn(async () =>
      Promise.reject(undefined)
    );

    const mockNavigateToConfirmationScreen = jest.fn();
    const mockNavigateToResultScreen = jest.fn();
    const mockExitUnsubscription = jest.fn();

    const machine = createIDPayUnsubscriptionMachine({
      initiativeId: T_INITIATIVE_ID,
      initiativeName: T_INITIATIVE_NAME
    }).withConfig({
      actions: {
        navigateToConfirmationScreen: mockNavigateToConfirmationScreen,
        navigateToResultScreen: mockNavigateToResultScreen,
        exitToWallet: jest.fn(),
        exitUnsubscription: mockExitUnsubscription
      },
      services: {
        getInitiativeInfo: jest.fn(),
        unsubscribeFromInitiative: mockUnsubscribeFromInitiative
      }
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    await waitFor(() =>
      expect(mockNavigateToConfirmationScreen).toHaveBeenCalled()
    );

    expect(currentState.value).toEqual("DISPLAYING_CONFIRMATION");

    service.send({
      type: "CONFIRM_UNSUBSCRIPTION"
    });

    expect(currentState.value).toEqual("UNSUBSCRIBING");

    await waitFor(() =>
      expect(mockUnsubscribeFromInitiative).toHaveBeenCalled()
    );

    await waitFor(() => expect(mockNavigateToResultScreen).toHaveBeenCalled());

    expect(currentState.value).toEqual("UNSUBSCRIPTION_FAILURE");

    service.send({
      type: "EXIT"
    });

    await waitFor(() => expect(mockExitUnsubscription).toHaveBeenCalled());
  });
});
