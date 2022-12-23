import * as p from "@pagopa/ts-commons/lib/pot";

import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  INSTRUMENTS = "INSTRUMENTS"
}

export type Context = {
  initiativeId?: string;
  mode: ConfigurationMode;
  initiative: p.Pot<InitiativeDTO, Error>;
  pagoPAInstruments: p.Pot<ReadonlyArray<Wallet>, Error>;
  idPayInstruments: p.Pot<ReadonlyArray<InstrumentDTO>, Error>;
  selectedInstrumentId?: string;
};

export const INITIAL_CONTEXT: Context = {
  initiative: p.none,
  mode: ConfigurationMode.COMPLETE,
  pagoPAInstruments: p.none,
  idPayInstruments: p.none
};
