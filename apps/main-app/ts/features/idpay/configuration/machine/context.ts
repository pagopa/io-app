import { IbanDTO } from "@io-app/api-types/generated/definitions/idpay/IbanDTO";
import { InitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { InstrumentDTO } from "@io-app/api-types/generated/definitions/idpay/InstrumentDTO";
import * as O from "fp-ts/lib/Option";

import { Wallet } from "../../../../types/pagopa";
import { ConfigurationMode, InstrumentStatusByIdWallet } from "../types";
import { InitiativeFailureType } from "../types/failure";

export type Context = {
  readonly areInstrumentsSkipped: boolean;
  readonly failure: O.Option<InitiativeFailureType>;
  readonly ibanList: ReadonlyArray<IbanDTO>;
  readonly initiative: O.Option<InitiativeDTO>;
  readonly initiativeId: string;
  readonly initiativeInstruments: ReadonlyArray<InstrumentDTO>;
  readonly instrumentStatuses: InstrumentStatusByIdWallet;
  readonly mode: ConfigurationMode;
  readonly walletInstruments: ReadonlyArray<Wallet>;
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
