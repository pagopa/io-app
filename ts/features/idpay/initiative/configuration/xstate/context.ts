import * as p from "@pagopa/ts-commons/lib/pot";

import { IbanListDTO } from "../../../../../../definitions/idpay/iban/IbanListDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  INSTRUMENTS = "INSTRUMENTS",
  IBAN = "IBAN"
}

export type Context = {
  initiativeId?: string;
  mode: ConfigurationMode;
  initiative: p.Pot<InitiativeDTO, Error>;
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  selectedInstrumentId?: string;
  ibanList: p.Pot<IbanListDTO["ibanList"], Error>;
  selectedIban?: string;
  ibanBody?: {
    iban: string;
    description: string;
  };
};

export const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  mode: ConfigurationMode.COMPLETE,
  pagoPAInstruments: p.none,
  idPayInstruments: p.none,
  ibanList: p.none
};
