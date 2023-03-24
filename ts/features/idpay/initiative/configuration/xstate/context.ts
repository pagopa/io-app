import * as p from "@pagopa/ts-commons/lib/pot";
import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/IbanPutDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatusEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";
import { InitiativeFailureType } from "./failure";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  IBAN = "IBAN",
  INSTRUMENTS = "INSTRUMENTS"
}

export type InstrumentStatusByIdWallet = {
  [idWallet: string]: p.Pot<InstrumentStatusEnum | undefined, Error>;
};

export type Context = {
  initiativeId?: string;
  mode: ConfigurationMode;
  initiative: p.Pot<InitiativeDTO, Error>;
  ibanList: p.Pot<ReadonlyArray<IbanDTO>, Error>;
  walletInstruments: ReadonlyArray<Wallet>;
  initiativeInstruments: ReadonlyArray<InstrumentDTO>;
  instrumentStatuses: InstrumentStatusByIdWallet;
  instrumentToEnroll?: Wallet;
  instrumentToDelete?: InstrumentDTO;
  areInstrumentsSkipped?: boolean;
  selectedIban?: IbanDTO;
  ibanBody?: IbanPutDTO;
  failure?: InitiativeFailureType;
};

export const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  mode: ConfigurationMode.COMPLETE,
  ibanList: p.none,
  walletInstruments: [],
  initiativeInstruments: [],
  instrumentStatuses: {}
};
