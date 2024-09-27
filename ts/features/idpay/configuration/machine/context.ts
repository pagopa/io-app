import * as O from "fp-ts/lib/Option";
import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { InstrumentDTO } from "../../../../../definitions/idpay/InstrumentDTO";
import { Wallet } from "../../../../types/pagopa";
import { ConfigurationMode, InstrumentStatusByIdWallet } from "../types";
import { InitiativeFailureType } from "../types/failure";

export type Context = {
  readonly initiativeId: string;
  readonly mode: ConfigurationMode;
  readonly initiative: O.Option<InitiativeDTO>;
  readonly ibanList: ReadonlyArray<IbanDTO>;
  readonly walletInstruments: ReadonlyArray<Wallet>;
  readonly initiativeInstruments: ReadonlyArray<InstrumentDTO>;
  readonly instrumentStatuses: InstrumentStatusByIdWallet;
  readonly areInstrumentsSkipped: boolean;
  readonly failure: O.Option<InitiativeFailureType>;
};

export const InitialContext: Context = {
  initiativeId: "",
  mode: ConfigurationMode.COMPLETE,
  initiative: O.none,
  ibanList: [],
  walletInstruments: [],
  initiativeInstruments: [],
  instrumentStatuses: {},
  areInstrumentsSkipped: false,
  failure: O.none
};
