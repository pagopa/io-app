import * as p from "@pagopa/ts-commons/lib/pot";
import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/IbanPutDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/InstrumentDTO";
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
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
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
  pagoPAInstruments: p.none,
  idPayInstruments: p.none
};
