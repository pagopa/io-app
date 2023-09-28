import { Receiver, Sender } from "xstate";
import { IbanListDTO } from "../../../../../../definitions/idpay/IbanListDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  InstrumentTypeEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";

import { TypeEnum as WalletTypeEnumV1 } from "../../../../../../definitions/pagopa/Wallet";
import { Wallet } from "../../../../../types/pagopa";
import { Events } from "../events";

export const T_INITIATIVE_ID = "123456";
export const T_IBAN = "IT60X0542811101000000123456";
export const T_INSTRUMENT_ID = "123456";
export const T_WALLET: Wallet = {
  idWallet: 123,
  type: WalletTypeEnumV1.CREDIT_CARD,
  favourite: false,
  creditCard: undefined,
  psp: undefined,
  idPsp: undefined,
  pspEditable: false,
  lastUsage: undefined,
  isPspToIgnore: false,
  registeredNexi: false,
  saved: true,
  paymentMethod: undefined
};

export const T_INSTRUMENT_DTO: InstrumentDTO = {
  instrumentId: "1234",
  idWallet: "12345",
  instrumentType: InstrumentTypeEnum.CARD
};

export const T_NOT_REFUNDABLE_INITIATIVE_DTO: InitiativeDTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.NOT_REFUNDABLE,
  endDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
};

export const T_REFUNDABLE_INITIATIVE_DTO: InitiativeDTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.REFUNDABLE,
  endDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
};

export const T_IBAN_LIST: IbanListDTO["ibanList"] = [
  {
    channel: "IO",
    checkIbanStatus: "",
    description: "Test",
    iban: T_IBAN
  }
];

export const T_PAGOPA_INSTRUMENTS = [T_WALLET];

export const mockEnrollInstrument: jest.Mock<Promise<undefined>> = jest.fn(
  async () => Promise.resolve(undefined)
);

export const mockDeleteInstrument: jest.Mock<Promise<undefined>> = jest.fn(
  async () => Promise.resolve(undefined)
);

const mockInstrumentsEnrollmentService = jest.fn(
  () => (callback: Sender<Events>, onReceive: Receiver<Events>) =>
    onReceive(async event => {
      switch (event.type) {
        case "DELETE_INSTRUMENT":
          mockDeleteInstrument()
            .then(() =>
              callback({
                ...event,
                type: "DELETE_INSTRUMENT_SUCCESS"
              })
            )
            .catch(() =>
              callback({
                ...event,
                type: "DELETE_INSTRUMENT_FAILURE"
              })
            );
          break;
        case "ENROLL_INSTRUMENT":
          mockEnrollInstrument()
            .then(() =>
              callback({
                ...event,
                type: "ENROLL_INSTRUMENT_SUCCESS"
              })
            )
            .catch(() =>
              callback({
                ...event,
                type: "ENROLL_INSTRUMENT_FAILURE"
              })
            );
          break;
        default:
          break;
      }
    })
);
export const mockServices = {
  loadInitiative: jest.fn(),
  loadIbanList: jest.fn(),
  enrollIban: jest.fn(),
  confirmIban: jest.fn(),
  loadWalletInstruments: jest.fn(),
  loadInitiativeInstruments: jest.fn(),
  instrumentsEnrollmentService: mockInstrumentsEnrollmentService
};
