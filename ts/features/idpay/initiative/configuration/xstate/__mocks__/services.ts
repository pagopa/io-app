import { IbanListDTO } from "../../../../../../../definitions/idpay/iban/IbanListDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../../definitions/idpay/wallet/InstrumentDTO";

import { TypeEnum as WalletTypeEnumV1 } from "../../../../../../../definitions/pagopa/Wallet";
import { Wallet } from "../../../../../../types/pagopa";
import { InitiativeFailureType } from "../failure";
import { createServicesImplementation } from "../services";

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

export const mockLoadInitiativeSuccessNotRefundable = jest.fn(
  async (): Promise<InitiativeDTO> => ({
    initiativeId: T_INITIATIVE_ID,
    status: StatusEnum.NOT_REFUNDABLE,
    endDate: new Date("2023-01-25T13:00:25.477Z"),
    nInstr: 1
  })
);

export const mockLoadInitiativeSuccessRefundable = jest.fn(
  async (): Promise<InitiativeDTO> => ({
    initiativeId: T_INITIATIVE_ID,
    status: StatusEnum.REFUNDABLE,
    endDate: new Date("2023-01-25T13:00:25.477Z"),
    nInstr: 1
  })
);

export const mockLoadInitiativeFailure = jest.fn(
  async (): Promise<InitiativeDTO> =>
    Promise.reject(InitiativeFailureType.INITIATIVE_ERROR)
);

export const mockLoadIbanListSuccess = jest.fn(
  async (): Promise<IbanListDTO> => ({
    ibanList: [
      { channel: "IO", checkIbanStatus: "", description: "Test", iban: T_IBAN }
    ]
  })
);

export const mockLoadIbanListSuccessEmpty = jest.fn(
  async (): Promise<IbanListDTO> => ({ ibanList: [] })
);

export const mockLoadIbanListFailure = jest.fn(
  async (): Promise<IbanListDTO> =>
    Promise.reject(InitiativeFailureType.IBAN_LIST_LOAD_FAILURE)
);

export const mockEnrollIbanSuccess = jest.fn(async () =>
  Promise.resolve(undefined)
);

export const mockEnrollIbanFailure = jest.fn(async () =>
  Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
);

export const mockConfirmIbanSuccess = jest.fn(
  async (): Promise<void> => Promise.resolve()
);

export const mockConfirmIbanFailure = jest.fn(
  async (): Promise<void> =>
    Promise.reject(InitiativeFailureType.IBAN_ENROLL_FAILURE)
);

export const mockLoadInstrumentsSuccess = jest.fn(
  async (): Promise<{
    pagoPAInstruments: ReadonlyArray<Wallet>;
    idPayInstruments: ReadonlyArray<InstrumentDTO>;
  }> => Promise.resolve({ pagoPAInstruments: [T_WALLET], idPayInstruments: [] })
);

export const mockLoadInstrumentsFailure = jest.fn(async () =>
  Promise.reject(InitiativeFailureType.INSTRUMENTS_LIST_LOAD_FAILURE)
);

export const mockLoadInstrumentsSuccessEmpty = jest.fn(
  async (): Promise<{
    pagoPAInstruments: ReadonlyArray<Wallet>;
    idPayInstruments: ReadonlyArray<InstrumentDTO>;
  }> => Promise.resolve({ pagoPAInstruments: [], idPayInstruments: [] })
);

export const mockEnrollInstrumentSuccess = jest.fn(async () =>
  Promise.resolve([])
);

export const mockDeleteInstrumentSuccess = jest.fn(async () =>
  Promise.resolve([])
);

export const mockEnrollInstrumentFailure = jest.fn(async () =>
  Promise.reject(InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE)
);

export const mockDeleteInstrumentFailure = jest.fn(async () =>
  Promise.reject(InitiativeFailureType.INSTRUMENT_DELETE_FAILURE)
);

export type MockServicesType = ReturnType<typeof createServicesImplementation>;

export const mockServices: MockServicesType = {
  loadInitiative: jest.fn(),
  loadIbanList: jest.fn(),
  confirmIban: jest.fn(),
  loadInstruments: jest.fn(),
  deleteInstrument: jest.fn(),
  enrollIban: jest.fn(),
  enrollInstrument: jest.fn()
};
