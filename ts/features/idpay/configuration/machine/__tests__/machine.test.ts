import { waitFor } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import { createActor, fromCallback, fromPromise } from "xstate";
import {
  CheckIbanStatusEnum,
  IbanDTO
} from "../../../../../../definitions/idpay/IbanDTO";
import { IbanListDTO } from "../../../../../../definitions/idpay/IbanListDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/IbanPutDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  InstrumentTypeEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";
import { TypeEnum } from "../../../../../../definitions/pagopa/Wallet";
import { Wallet } from "../../../../../types/pagopa";
import { IdPayTags } from "../../../common/machine/tags";
import { ConfigurationMode } from "../../types";
import { Context, InitialContext } from "../context";
import { IdPayConfigurationEvents } from "../events";
import { idPayConfigurationMachine } from "../machine";
import { InitiativeFailureType } from "../../types/failure";

export const T_INITIATIVE_ID = "123456";
export const T_IBAN = "IT60X0542811101000000123456";
export const T_INSTRUMENT_ID = "123456";

export const T_WALLET: Wallet = {
  idWallet: 123,
  type: TypeEnum.CREDIT_CARD,
  favourite: false,
  creditCard: undefined,
  psp: undefined,
  idPsp: undefined,
  pspEditable: false,
  lastUsage: undefined,
  isPspToIgnore: false,
  registeredNexi: false,
  saved: true
};

export const T_INSTRUMENT_DTO: InstrumentDTO = {
  instrumentId: "1234",
  idWallet: "12345",
  instrumentType: InstrumentTypeEnum.CARD
};

export const T_NOT_REFUNDABLE_INITIATIVE_DTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.NOT_REFUNDABLE,
  voucherEndDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
} as InitiativeDTO;

export const T_REFUNDABLE_INITIATIVE_DTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.REFUNDABLE,
  voucherEndDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
} as InitiativeDTO;

export const T_IBAN_LIST = [
  {
    channel: "IO",
    checkIbanStatus: CheckIbanStatusEnum.OK,
    description: "Test",
    iban: T_IBAN
  }
] as IbanListDTO["ibanList"];

export const T_PAGOPA_INSTRUMENTS = [T_WALLET];

const T_IBAN_ENROLL: IbanDTO = {
  channel: "IO",
  checkIbanStatus: CheckIbanStatusEnum.OK,
  description: "Test",
  iban: T_IBAN
};

describe("IDPay configuration machine", () => {
  const exitConfiguration = jest.fn();
  const navigateToConfigurationIntro = jest.fn();
  const navigateToIbanEnrollmentScreen = jest.fn();
  const navigateToIbanOnboardingScreen = jest.fn();
  const navigateToIbanOnboardingFormScreen = jest.fn();
  const showUpdateIbanToast = jest.fn();
  const navigateToInstrumentsEnrollmentScreen = jest.fn();
  const navigateToConfigurationSuccessScreen = jest.fn();
  const navigateToInitiativeDetailScreen = jest.fn();
  const handleSessionExpired = jest.fn();
  const showFailureToast = jest.fn();

  const getInitiative = jest.fn();
  const getIbanList = jest.fn();
  const enrollIban = jest.fn();
  const getWalletInstruments = jest.fn();
  const getInitiativeInstruments = jest.fn();
  const instrumentsEnrollmentLogic = jest.fn();

  const mockedMachine = idPayConfigurationMachine.provide({
    actions: {
      exitConfiguration,
      navigateToConfigurationIntro,
      navigateToIbanEnrollmentScreen,
      navigateToIbanOnboardingScreen,
      navigateToIbanOnboardingFormScreen,
      showUpdateIbanToast,
      navigateToInstrumentsEnrollmentScreen,
      navigateToConfigurationSuccessScreen,
      navigateToInitiativeDetailScreen,
      handleSessionExpired,
      showFailureToast
    },
    actors: {
      getInitiative: fromPromise<InitiativeDTO, string>(getInitiative),
      getIbanList: fromPromise<IbanListDTO>(getIbanList),
      enrollIban: fromPromise<
        undefined,
        { initiativeId: string; iban: IbanDTO | IbanPutDTO }
      >(enrollIban),
      getWalletInstruments:
        fromPromise<ReadonlyArray<Wallet>>(getWalletInstruments),
      getInitiativeInstruments: fromPromise<
        ReadonlyArray<InstrumentDTO>,
        string
      >(getInitiativeInstruments),
      instrumentsEnrollmentLogic: fromCallback<
        IdPayConfigurationEvents,
        string
      >(instrumentsEnrollmentLogic)
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start with the initial state", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(
      new Set([IdPayTags.Loading])
    );
  });

  it("should not allow the citizen to configure an initiative if it's already configured", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_REFUNDABLE_INITIATIVE_DTO)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(
      new Set([IdPayTags.Loading])
    );

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      initiative: O.some(T_REFUNDABLE_INITIATIVE_DTO)
    });

    await waitFor(() =>
      expect(navigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().value).toMatch("ConfigurationNotNeeded");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    actor.send({
      type: "next"
    });

    expect(actor.getSnapshot().value).toMatch("ConfigurationCompleted");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    await waitFor(() =>
      expect(navigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow the citizen to configure an initiative", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    enrollIban.mockImplementation(async () => Promise.resolve(undefined));

    getWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    getInitiativeInstruments.mockImplementation(async () =>
      Promise.resolve([])
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toEqual("DisplayingConfigurationIntro");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      initiative: O.some(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      ibanList: T_IBAN_LIST
    });

    await waitFor(
      // Called twice: once from the parent state, once from the child state
      () => expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(2)
    );

    actor.send({
      type: "enroll-iban",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(getWalletInstruments).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(getInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      walletInstruments: T_PAGOPA_INSTRUMENTS
    });

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringInstruments: {
        DisplayingInstruments: "DisplayingInstrument"
      }
    });

    await waitFor(() =>
      expect(navigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "enroll-instrument",
      walletId: T_WALLET.idWallet.toString()
    });

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringInstruments: {
        DisplayingInstruments: "DisplayingInstrument"
      }
    });

    await waitFor(() =>
      expect(navigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "delete-instrument",
      walletId: T_WALLET.idWallet.toString(),
      instrumentId: T_INSTRUMENT_DTO.instrumentId
    });

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringInstruments: {
        DisplayingInstruments: "DisplayingInstrument"
      }
    });

    await waitFor(() =>
      expect(navigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "next"
    });

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationSuccess");

    await waitFor(() =>
      expect(navigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "next"
    });

    expect(actor.getSnapshot().value).toMatch("ConfigurationCompleted");

    await waitFor(() =>
      expect(navigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should allow a citizen without any IBAN to configure an initiative", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: [] })
    );

    enrollIban.mockImplementation(async () => Promise.resolve());

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanOnboardingLanding"
    });

    await waitFor(() =>
      expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanOnboardingForm"
    });

    await waitFor(() =>
      expect(navigateToIbanOnboardingScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "confirm-iban-onboarding",
      ibanBody: {
        description: "Test",
        iban: T_IBAN
      }
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    // From here same as previous test case
  });

  it("should allow a citizen without any instrument to configure an initiative", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    enrollIban.mockImplementation(async () => Promise.resolve(undefined));

    getWalletInstruments.mockImplementation(async () => Promise.resolve([]));

    getInitiativeInstruments.mockImplementation(async () =>
      Promise.resolve([])
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });

    await waitFor(() =>
      expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(2)
    );

    actor.send({
      type: "enroll-iban",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(navigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationSuccess");
  });

  it("should allow the citizen to configure an initiative skipping the instrument step", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    enrollIban.mockImplementation(async () => Promise.resolve(undefined));

    getWalletInstruments.mockImplementation(async () =>
      Promise.resolve(T_PAGOPA_INSTRUMENTS)
    );

    getInitiativeInstruments.mockImplementation(async () =>
      Promise.resolve([])
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });

    await waitFor(() =>
      expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(2)
    );

    actor.send({
      type: "enroll-iban",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(getWalletInstruments).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(getInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringInstruments: {
        DisplayingInstruments: "DisplayingInstrument"
      }
    });

    await waitFor(() =>
      expect(navigateToInstrumentsEnrollmentScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "skip-instruments"
    });

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationSuccess");

    await waitFor(() =>
      expect(navigateToConfigurationSuccessScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "next"
    });

    expect(actor.getSnapshot().value).toMatch("ConfigurationCompleted");

    await waitFor(() =>
      expect(navigateToInitiativeDetailScreen).toHaveBeenCalledTimes(1)
    );
  });

  it("should go to CONFIGURATION_FAILURE if initiative fails to load", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.GENERIC)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toEqual("ConfigurationFailure");
  });

  it("should show a failure toast if IBAN list fails to load", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(showFailureToast).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");
  });

  it("should show a failure toast if IBAN fails to enroll", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    enrollIban.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });

    await waitFor(() =>
      expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(2)
    );

    actor.send({
      type: "enroll-iban",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(showFailureToast).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });
  });

  it("should show a failure toast if IBAN fails to add", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: [] })
    );

    enrollIban.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanOnboardingLanding"
    });

    await waitFor(() =>
      expect(navigateToIbanOnboardingScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanOnboardingForm"
    });

    await waitFor(() =>
      expect(navigateToIbanOnboardingScreen).toHaveBeenCalledTimes(1)
    );

    actor.send({
      type: "confirm-iban-onboarding",
      ibanBody: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(showFailureToast).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanOnboardingForm"
    });
  });

  it("should show a failure toast if instrument list fails to load", async () => {
    getInitiative.mockImplementation(async () =>
      Promise.resolve(T_NOT_REFUNDABLE_INITIATIVE_DTO)
    );

    getIbanList.mockImplementation(async () =>
      Promise.resolve({ ibanList: T_IBAN_LIST })
    );

    enrollIban.mockImplementation(async () => Promise.resolve(undefined));

    getWalletInstruments.mockImplementation(async () =>
      Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE)
    );

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toEqual("Idle");

    actor.send({
      type: "start-configuration",
      initiativeId: T_INITIATIVE_ID,
      mode: ConfigurationMode.COMPLETE
    });

    await waitFor(() => expect(getInitiative).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatch("DisplayingConfigurationIntro");

    await waitFor(() =>
      expect(navigateToConfigurationIntro).toHaveBeenCalledTimes(1)
    );

    actor.send({ type: "next" });

    await waitFor(() => expect(getIbanList).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });

    await waitFor(() =>
      expect(navigateToIbanEnrollmentScreen).toHaveBeenCalledTimes(2)
    );

    actor.send({
      type: "enroll-iban",
      iban: T_IBAN_ENROLL
    });

    await waitFor(() => expect(enrollIban).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(getWalletInstruments).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(getInitiativeInstruments).toHaveBeenCalledTimes(1)
    );

    await waitFor(() => expect(showFailureToast).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toMatchObject({
      ConfiguringIban: "DisplayingIbanList"
    });
  });
});
