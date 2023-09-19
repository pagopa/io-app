/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/no-let */
import { waitFor } from "@testing-library/react-native";
import { interpret, StateValue } from "xstate";
import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { ConfigurationMode } from "../context";
import { InitiativeFailureType } from "../failure";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import {
  ibanListSelector,
  selectInitiativeDetails,
  selectWalletInstruments
} from "../selectors";
import { mockActions } from "../__mocks__/actions";
import {
  mockDeleteInstrument,
  mockEnrollInstrument,
  mockServices,
  T_IBAN,
  T_IBAN_LIST,
  T_INITIATIVE_ID,
  T_INSTRUMENT_DTO,
  T_NOT_REFUNDABLE_INITIATIVE_DTO,
  T_PAGOPA_INSTRUMENTS,
  T_REFUNDABLE_INITIATIVE_DTO,
  T_WALLET
} from "../__mocks__/services";

const T_IBAN_ENROLL: IbanDTO = {
  channel: "IO",
  checkIbanStatus: "",
  description: "Test",
  iban: T_IBAN
};

describe("IDPay configuration machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have the default state of WAITING_START", () => {
    const machine = createIDPayInitiativeConfigurationMachine();
    expect(machine.initialState.value).toEqual("WAITING_START");
  });

  it("should not allow the citizen to configure an initiative if it's already configured", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_REFUNDABLE_INITIATIVE_DTO)
    );

    const machine = createIDPayInitiativeConfigurationMachine().withConfig({
      services: mockServices,
      actions: mockActions
    });

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(selectInitiativeDetails(currentState as never)).toStrictEqual(
      T_REFUNDABLE_INITIATIVE_DTO
    );

    await waitFor(() =>
      expect(
        mockActions.navigateToConfigurationSuccessScreen
      ).toHaveBeenCalledTimes(1)
    );

    expect(currentState.value).toMatch("CONFIGURATION_NOT_NEEDED");

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState.value).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(
        mockActions.navigateToInitiativeDetailScreen
      ).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow the citizen to configure an initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.resolve(undefined)
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

    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(selectInitiativeDetails(currentState as never)).toStrictEqual(
      T_NOT_REFUNDABLE_INITIATIVE_DTO
    );

    expect(currentState.value).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(ibanListSelector(currentState as never)).toStrictEqual(T_IBAN_LIST);

    expect(currentState.value).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(
        1
      )
    );

    service.send({
      type: "ENROLL_IBAN",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadWalletInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(selectWalletInstruments(currentState as never)).toStrictEqual(
      T_PAGOPA_INSTRUMENTS
    );

    expect(currentState.value).toMatchObject({
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
      walletId: T_WALLET.idWallet.toString()
    });

    await waitFor(() => expect(mockEnrollInstrument).toHaveBeenCalledTimes(1));

    expect(currentState.value).toMatchObject({
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
      walletId: T_WALLET.idWallet.toString(),
      instrumentId: T_INSTRUMENT_DTO.instrumentId
    });

    await waitFor(() => expect(mockDeleteInstrument).toHaveBeenCalledTimes(1));

    expect(currentState.value).toMatchObject({
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
      type: "NEXT"
    });

    expect(currentState.value).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    await waitFor(() =>
      expect(
        mockActions.navigateToConfigurationSuccessScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState.value).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(
        mockActions.navigateToInitiativeDetailScreen
      ).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow a citizen without any IBAN to configure an initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: [] })
    );

    mockServices.confirmIban.mockImplementation(async () => Promise.resolve());

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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanLandingScreen).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING_FORM"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanOnboardingScreen).toHaveBeenCalledTimes(
        1
      )
    );

    service.send({
      type: "CONFIRM_IBAN",
      ibanBody: {
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() =>
      expect(mockServices.confirmIban).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
    });

    // From here same as previous test case
  });

  it("should allow a citizen without any instrument to configure an initiative", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.loadWalletInstruments.mockImplementation(async () =>
      Promise.resolve([])
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

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
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(
        mockActions.navigateToInstrumentsEnrollmentScreen
      ).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    service.send({
      type: "ADD_PAYMENT_METHOD"
    });

    await waitFor(() =>
      expect(
        mockActions.navigateToAddPaymentMethodScreen
      ).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(
        mockActions.navigateToInitiativeDetailScreen
      ).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow the citizen to configure an initiative skipping the instrument step", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.resolve(undefined)
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

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
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
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
      type: "SKIP"
    });

    expect(currentState).toMatch("DISPLAYING_CONFIGURATION_SUCCESS");

    await waitFor(() =>
      expect(
        mockActions.navigateToConfigurationSuccessScreen
      ).toHaveBeenCalledTimes(1)
    );

    service.send({
      type: "COMPLETE_CONFIGURATION"
    });

    expect(currentState).toMatch("CONFIGURATION_COMPLETED");

    await waitFor(() =>
      expect(
        mockActions.navigateToInitiativeDetailScreen
      ).toHaveBeenCalledTimes(1)
    );
  });

  it("should go to CONFIGURATION_FAILURE if initiative fails to load", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.GENERIC)
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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toEqual("CONFIGURATION_FAILURE");
  });

  it("should show a failure toast if IBAN list fails to load", async () => {
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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockActions.showFailureToast).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");
  });

  it("should show a failure toast if IBAN fails to enroll", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

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
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockActions.showFailureToast).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });
  });

  it("should show a failure toast if IBAN fails to add", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: [] })
    );

    mockServices.confirmIban.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    await waitFor(() =>
      expect(mockServices.loadIbanList).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanLandingScreen).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING_FORM"
    });

    await waitFor(() =>
      expect(mockActions.navigateToIbanOnboardingScreen).toHaveBeenCalledTimes(
        1
      )
    );

    service.send({
      type: "CONFIRM_IBAN",
      ibanBody: {
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() =>
      expect(mockServices.confirmIban).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockActions.showFailureToast).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_ONBOARDING_FORM"
    });
  });

  it("should show a failure toast if instrument list fails to load", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.loadWalletInstruments.mockImplementation(async () =>
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

    expect(currentState).toEqual("WAITING_START");

    service.send({
      type: "START_CONFIGURATION",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

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
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadWalletInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockServices.loadInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockActions.showFailureToast).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_IBAN: "DISPLAYING_IBAN_LIST"
    });
  });

  it("should show a failure toast if instruments fails to enroll/delete", async () => {
    mockServices.loadInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    mockServices.loadIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    mockServices.enrollIban.mockImplementation(async () =>
      Promise.resolve(undefined)
    );

    mockServices.loadWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    mockServices.loadInitiativeInstruments.mockImplementation(async () =>
      Promise.resolve([])
    );

    mockEnrollInstrument.mockImplementation(async () => Promise.reject());

    mockDeleteInstrument.mockImplementation(async () => Promise.reject());

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
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() =>
      expect(mockServices.loadInitiative).toHaveBeenCalledTimes(1)
    );

    expect(currentState).toMatch("DISPLAYING_INTRO");

    await waitFor(() =>
      expect(mockActions.navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    service.send({ type: "NEXT" });

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
      iban: T_IBAN_ENROLL
    });

    await waitFor(() =>
      expect(mockServices.enrollIban).toHaveBeenCalledTimes(1)
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
      walletId: T_WALLET.idWallet.toString()
    });

    await waitFor(() => expect(mockEnrollInstrument).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(mockActions.showInstrumentFailureToast).toHaveBeenCalledTimes(1)
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
      type: "DELETE_INSTRUMENT",
      walletId: T_WALLET.idWallet.toString(),
      instrumentId: T_INSTRUMENT_DTO.instrumentId
    });

    await waitFor(() => expect(mockDeleteInstrument).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(mockActions.showInstrumentFailureToast).toHaveBeenCalledTimes(2)
    );

    expect(currentState).toMatchObject({
      CONFIGURING_INSTRUMENTS: {
        DISPLAYING_INSTRUMENTS: "DISPLAYING"
      }
    });
  });
});
