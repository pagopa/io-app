import * as p from "@pagopa/ts-commons/lib/pot";
import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/wallet/IbanPutDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";
import { InitiativeFailureType } from "./failure";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  IBAN = "IBAN",
  INSTRUMENTS = "INSTRUMENTS"
}

export type Context = {
  initiativeId?: string;
  mode: ConfigurationMode;
  initiative: p.Pot<InitiativeDTO, Error>;
  ibanList: p.Pot<ReadonlyArray<IbanDTO>, Error>;
  walletInstruments: ReadonlyArray<Wallet>;
  initiativeInstruments: ReadonlyArray<p.Pot<InstrumentDTO, Error>>;
  stagedInstrumentId?: number;
  selectedInstrumentId?: string;
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
  initiativeInstruments: []
};
