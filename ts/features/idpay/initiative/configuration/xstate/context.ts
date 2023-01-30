import * as p from "@pagopa/ts-commons/lib/pot";
import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
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
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  selectedInstrumentId?: string;
  selectedIban?: IbanDTO;
  ibanBody?: {
    iban: string;
    description: string;
  };
  failure?: InitiativeFailureType;
};

export const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  mode: ConfigurationMode.COMPLETE,
  ibanList: p.none,
  pagoPAInstruments: p.none,
  idPayInstruments: p.none
};
