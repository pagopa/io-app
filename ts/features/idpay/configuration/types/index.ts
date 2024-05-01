import * as pot from "@pagopa/ts-commons/lib/pot";
import { StatusEnum as InstrumentStatusEnum } from "../../../../../definitions/idpay/InstrumentDTO";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  IBAN = "IBAN",
  INSTRUMENTS = "INSTRUMENTS"
}

export type InstrumentStatusByIdWallet = {
  [idWallet: string]: pot.Pot<InstrumentStatusEnum | undefined, Error>;
};
