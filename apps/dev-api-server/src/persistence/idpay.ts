import { fakerIT as faker } from "@faker-js/faker";
import {
  CheckIbanStatusEnum,
  IbanDTO
} from "@io-app/api-types/generated/definitions/idpay/IbanDTO";
import {
  ChannelEnum,
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/IbanOperationDTO";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatusEnum,
  VoucherStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus,
  InstrumentTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/InstrumentDTO";
import {
  InstrumentOperationDTO,
  InstrumentTypeEnum as InstrumentOperationInstrumentTypeEnum,
  OperationTypeEnum as InstrumentOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "@io-app/api-types/generated/definitions/idpay/OperationListDTO";
import {
  ReadmittedOperationDTO,
  OperationTypeEnum as ReadmittedOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/ReadmittedOperationDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/RefundOperationDTO";
import {
  InstrumentTypeEnum as OperationInstrumentTypeEnum,
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/RejectedInstrumentOperationDTO";
import {
  SuspendOperationDTO,
  OperationTypeEnum as SuspendOperationTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/SuspendOperationDTO";
import {
  StatusEnum,
  TransactionBarCodeResponse
} from "@io-app/api-types/generated/definitions/idpay/TransactionBarCodeResponse";
import {
  ChannelEnum as TransactionChannelEnum,
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationTypeEnum,
  StatusEnum as TransactionStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/TransactionOperationDTO";
import {
  StatusEnum as OnboardedInitiativeStatusEnum,
  UserOnboardingStatusDTO
} from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";
import { WalletV2 } from "@io-app/api-types/generated/definitions/pagopa/WalletV2";
import * as O from "fp-ts/lib/Option";
import { range } from "lodash";
import { ulid } from "ulid";

import { ioDevServerConfig } from "../config";
import { InitiativeDataDTOWithServiceId } from "../payloads/features/idpay/types";
import { getRandomEnumValue } from "../payloads/utils/random";
import { getWalletV2 } from "../routers/walletsV2";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import { serverUrl } from "../utils/server";

const idPayConfig = ioDevServerConfig.features.idpay;
const { idPay: walletConfig } = ioDevServerConfig.wallet;

const pagoPaWallet: WalletV2 = getWalletV2()[0];

const generateRandomInitiativeDTO = (): InitiativeDTO => {
  const amountCents = faker.number.int({ min: 5000, max: 20000 });
  const accruedCents = faker.number.int({ max: 20000 });
  const refundedCents = faker.number.int({ max: accruedCents });

  return {
    initiativeId: ulid(),
    initiativeName: faker.company.name(),
    voucherStatus: getRandomEnumValue(VoucherStatusEnum),
    status: getRandomEnumValue(InitiativeStatusEnum),
    initiativeEndDate: faker.date.future({ years: 1 }),
    voucherEndDate: faker.date.future({ years: 1 }),
    voucherStartDate: faker.date.past({ years: 1 }),
    amountCents,
    accruedCents,
    initiativeRewardType: getRandomEnumValue(InitiativeRewardTypeEnum),
    refundedCents,
    lastCounterUpdate: faker.date.recent({ days: 1 }),
    iban: faker.helpers.arrayElement(ibanList)?.iban || "",
    nInstr: 1,
    logoURL: faker.image.urlLoremFlickr({ width: 480, height: 480 }),
    organizationName: faker.company.name()
  };
};

const generateRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban({ formatted: false }),
  checkIbanStatus: getRandomEnumValue(CheckIbanStatusEnum),
  holderBank: faker.company.name(),
  description: faker.company.buzzPhrase(),
  channel: faker.string.sample()
});

const generateRandomTransactionOperationDTO = (
  withInfo?: Partial<TransactionOperationDTO>
): TransactionOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(TransactionOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    accruedCents: faker.number.int({ min: 500, max: 2500 }),
    amountCents: faker.number.int({ min: 5000, max: 10000 }),
    brand,
    circuitType: "01",
    brandLogo,
    maskedPan,
    status: getRandomEnumValue(TransactionStatusEnum),
    channel: getRandomEnumValue(TransactionChannelEnum),
    businessName: faker.company.name(),
    eventId: ulid(),
    ...withInfo
  };
};

const generateRandomTransactionOperationExpenseDTO = (
  withInfo?: Partial<TransactionOperationDTO>
): TransactionOperationDTO => ({
  operationType: getRandomEnumValue(TransactionOperationTypeEnum),
  operationDate: new Date(),
  operationId: ulid(),
  accruedCents: faker.number.int({ min: 500, max: 2500 }),
  amountCents: faker.number.int({ min: 5000, max: 10000 }),
  circuitType: "01",
  status: getRandomEnumValue(TransactionStatusEnum),
  businessName: faker.company.name(),
  eventId: ulid(),
  ...withInfo
});

const generateRandomRefundOperationDTO = (
  withInfo?: Partial<RefundOperationDTO>
): RefundOperationDTO => ({
  operationType: getRandomEnumValue(RefundOperationTypeEnum),
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amountCents: faker.number.int({ min: 500, max: 10000 }),
  ...withInfo
});

const generateRandomIbanOperationDTO = (): IbanOperationDTO => ({
  operationType: IbanOperationTypeEnum.ADD_IBAN,
  operationDate: new Date(),
  operationId: ulid(),
  channel: getRandomEnumValue(ChannelEnum),
  iban: faker.helpers.arrayElement(ibanList)?.iban || ""
});

const generateRandomOnboardingOperationDTO = (): OnboardingOperationDTO => ({
  operationType: OnboardingOperationTypeEnum.ONBOARDING,
  operationDate: new Date(),
  operationId: ulid()
});

const generateRandomInstrumentOperationDTO = (
  withInfo?: Partial<InstrumentOperationDTO>
): InstrumentOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(InstrumentOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    brand,
    brandLogo,
    channel: getRandomEnumValue(TransactionChannelEnum),
    maskedPan,
    instrumentType: getRandomEnumValue(OperationInstrumentTypeEnum),
    ...withInfo
  };
};

const generateRandomRejectedInstrumentOperationDTO = (
  withInfo?: Partial<RejectedInstrumentOperationDTO>
): RejectedInstrumentOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(RejectedInstrumentOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    brand,
    brandLogo,
    channel: getRandomEnumValue(TransactionChannelEnum),
    maskedPan,
    instrumentType: getRandomEnumValue(OperationInstrumentTypeEnum),
    ...withInfo
  };
};

const generateRandomSuspendOperationDTO = (): SuspendOperationDTO => ({
  operationType: SuspendOperationTypeEnum.SUSPENDED,
  operationDate: new Date(),
  operationId: ulid()
});

const generateRandomReadmittedOperationDTO = (): ReadmittedOperationDTO => ({
  operationType: ReadmittedOperationTypeEnum.READMITTED,
  operationDate: new Date(),
  operationId: ulid()
});

// eslint-disable-next-line functional/no-let
export let initiatives: { [id: string]: InitiativeDTO } = {};

// eslint-disable-next-line functional/no-let
export let initiativeTimeline: {
  [initiativeId: string]: ReadonlyArray<OperationListDTO>;
} = {};

// eslint-disable-next-line functional/no-let
export let ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: idPayConfig.ibanSize },
  () => generateRandomIbanDTO()
);

// eslint-disable-next-line functional/no-let
export let instruments: {
  [initiativeId: string]: ReadonlyArray<InstrumentDTO>;
} = {};

export const storeIban = (iban: string, description: string) =>
  (ibanList = [...ibanList, { ...generateRandomIbanDTO(), iban, description }]);

export const enrollInstrumentToInitiative = (
  initiativeId: string,
  wallet: WalletV2
): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const isAlreadyEnrolled = initiativeInstruments.some(
    i => i.idWallet === wallet.idWallet?.toString()
  );

  if (isAlreadyEnrolled) {
    return false;
  }

  const instrumentId = ulid();

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments,
      {
        instrumentId,
        idWallet: wallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        {
          ...initiativeInstruments[index],
          status: InstrumentStatus.ACTIVE
        },
        ...initiativeInstruments.slice(index + 1)
      ]
    };
  }, 5000);

  return true;
};

export const deleteInstrumentFromInitiative = (
  initiativeId: string,
  instrumentId: string
): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const index = initiativeInstruments.findIndex(
    i => i.instrumentId === instrumentId
  );

  if (
    index < 0 ||
    initiativeInstruments[index].status !== InstrumentStatus.ACTIVE
  ) {
    return false;
  }

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments.slice(0, index),
      {
        ...initiativeInstruments[index],
        status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
      },
      ...initiativeInstruments.slice(index + 1)
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        ...initiativeInstruments.slice(index + 1)
      ]
    };
  }, 5000);

  return true;
};

export const updateInitiative = (initiative: InitiativeDTO) =>
  (initiatives = { ...initiatives, [initiative.initiativeId]: initiative });

range(0, walletConfig.refundCount).forEach(() => {
  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatusEnum.REFUNDABLE
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.PAID_REFUND
      }),
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.REJECTED_REFUND
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.REVERSAL,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.CANCELLED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED,
        businessName: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomIbanOperationDTO(),
      generateRandomRejectedInstrumentOperationDTO({
        operationType:
          RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD,
        brand: undefined,
        maskedPan: undefined
      }),
      generateRandomRejectedInstrumentOperationDTO({
        operationType:
          RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD,
        brand: undefined,
        maskedPan: undefined
      }),
      generateRandomReadmittedOperationDTO(),
      generateRandomSuspendOperationDTO(),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

range(0, walletConfig.refundNotConfiguredCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [NC]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatusEnum.NOT_REFUNDABLE,
    iban: undefined,
    nInstr: 0
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = { ...instruments, [initiativeId]: [] };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [generateRandomOnboardingOperationDTO()]
  };
});

range(0, walletConfig.refundUnsubscribedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [U]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatusEnum.UNSUBSCRIBED
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [generateRandomOnboardingOperationDTO()]
  };
});

range(0, walletConfig.refundSuspendedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [S]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatusEnum.SUSPENDED
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.PAID_REFUND
      }),
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.REJECTED_REFUND
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.CANCELLED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        businessName: undefined
      }),
      generateRandomTransactionOperationDTO(),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

range(0, walletConfig.discountCount).forEach(() => {
  const initiativeName = `Bonus Elettrodomestici`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    voucherStatus: VoucherStatusEnum.ACTIVE,
    amountCents: 10000,
    organizationName: "Ministero delle Imprese e del Made in Italy",
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT,
    status: InitiativeStatusEnum.REFUNDABLE,
    iban: undefined,
    nInstr: 0,
    accruedCents: 0,
    refundedCents: 0,
    lastCounterUpdate: undefined,
    logoURL: undefined,
    webViewUrl: "https://www.google.it/"
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.APP_IO_PAYMENT
      }
    ]
  };

  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.REWARDED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined
      }),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

range(0, walletConfig.expenseCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [E]`;
  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.EXPENSE,
    status: InitiativeStatusEnum.REFUNDABLE,
    webViewUrl: `iosso://${serverUrl}/fims/relyingParty/1/landingPage`
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.PAID_REFUND
      }),
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.REJECTED_REFUND
      }),
      generateRandomTransactionOperationExpenseDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomTransactionOperationExpenseDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomTransactionOperationExpenseDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

// eslint-disable-next-line functional/no-let
export let idPayCode: string | undefined;

export const generateIdPayCode = () => {
  idPayCode = faker.string.numeric(5);
};

export const enrollCodeToInitiative = (initiativeId: string): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const isAlreadyEnrolled = initiativeInstruments.some(
    i => i.instrumentType === InstrumentTypeEnum.IDPAYCODE
  );

  if (isAlreadyEnrolled || idPayCode === undefined) {
    return false;
  }

  const instrumentId = ulid();

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments,
      {
        instrumentId,
        activationDate: new Date(),
        status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST,
        instrumentType: InstrumentTypeEnum.IDPAYCODE
      }
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        {
          ...initiativeInstruments[index],
          status: InstrumentStatus.ACTIVE
        },
        ...initiativeInstruments.slice(index + 1)
      ]
    };
  }, 5000);

  return true;
};

// eslint-disable-next-line functional/no-let
let barcodeTransactions: {
  [initiativeID: string]: TransactionBarCodeResponse;
} = {};

export const getIdPayBarcodeTransaction = (
  initiativeId: string,
  trxExpirationSeconds = 60
): TransactionBarCodeResponse => {
  const currentBarcode = barcodeTransactions[initiativeId];
  if (currentBarcode === undefined) {
    const newBarcodeTransaction: TransactionBarCodeResponse = {
      id: ulid(),
      trxCode: faker.string.alphanumeric(8),
      initiativeId,
      status: StatusEnum.CREATED,
      trxDate: new Date(),
      trxExpirationSeconds,
      initiativeName: faker.company.name(),
      residualBudgetCents:
        10000 as TransactionBarCodeResponse["residualBudgetCents"]
    };
    barcodeTransactions = {
      ...barcodeTransactions,
      [initiativeId]: newBarcodeTransaction
    };
    return newBarcodeTransaction;
  } else {
    const timeDiff = new Date().getTime() - currentBarcode.trxDate.getTime();
    // trxExpirationMinutes is in minutes, timeDiff is in milliseconds
    const isExpired = timeDiff > trxExpirationSeconds * 1000;
    if (isExpired) {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-dynamic-delete
      delete barcodeTransactions[initiativeId];
      return getIdPayBarcodeTransaction(initiativeId, trxExpirationSeconds);
    }
    return currentBarcode;
  }
};

// ==== Onboarded Initiative Statuses ====
// eslint-disable-next-line functional/no-let
export let onboardedInitiativeStatuses: Array<UserOnboardingStatusDTO> = [];

export const addOnboardedInitiativeStatus = (
  initiative: InitiativeDataDTOWithServiceId | undefined,
  status: OnboardedInitiativeStatusEnum
) => {
  if (
    !initiative ||
    onboardedInitiativeStatuses.find(
      onboardedInitiative =>
        onboardedInitiative.initiativeId === initiative.initiativeId
    )
  ) {
    return;
  }
  onboardedInitiativeStatuses = [
    ...onboardedInitiativeStatuses,
    {
      initiativeId: initiative.initiativeId,
      initiativeName: initiative.initiativeName ?? "",
      serviceId: initiative.serviceId ?? "",
      status,
      statusDate: new Date()
    }
  ];
};

export const getIDPayStaticCode = (
  initiativeId: string
): O.Option<TransactionBarCodeResponse> =>
  O.fromNullable({
    id: ulid(),
    trxCode: faker.string.alphanumeric(8),
    initiativeId,
    initiativeName: faker.company.name(),
    trxDate: new Date(),
    status: StatusEnum.CREATED,
    trxExpirationSeconds: 1296000, // 15 days
    residualBudgetCents: 0 as TransactionBarCodeResponse["residualBudgetCents"]
  });
