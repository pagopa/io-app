import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";

const T_INITIATIVE_ID = "123456";

// Mocked services
export const mockLoadInitiativeSuccess = jest.fn(
  async (): Promise<InitiativeDTO> => ({
    initiativeId: T_INITIATIVE_ID,
    status: StatusEnum.REFUNDABLE,
    endDate: new Date("2023-01-25T13:00:25.477Z"),
    nInstr: 1
  })
);
export const mockLoadInitiativeFailure = jest.fn(
  async (): Promise<InitiativeDTO> => Promise.reject("")
);

export const mockConfirmIban = jest.fn();
export const mockDeleteInstrument = jest.fn();
export const mockEnrollIban = jest.fn();
export const mockEnrollInstrument = jest.fn();
export const mockLoadIbanList = jest.fn();
export const mockLoadInstruments = jest.fn();
