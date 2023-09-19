import * as p from "@pagopa/ts-commons/lib/pot";
import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/IbanPutDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  CardInstrumentDTO,
  StatusEnum as InstrumentStatusEnum
} from "../../../../../../definitions/idpay/CardInstrumentDTO";
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
  initiativeInstruments: ReadonlyArray<CardInstrumentDTO>;
  instrumentStatuses: InstrumentStatusByIdWallet;
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
