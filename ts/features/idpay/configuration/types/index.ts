import * as pot from "@pagopa/ts-commons/lib/pot";
import { z } from "zod";
import { StatusEnum as InstrumentStatusEnum } from "../../../../../definitions/idpay/InstrumentDTO";

export enum ConfigurationMode {
  COMPLETE = "COMPLETE",
  IBAN = "IBAN",
  INSTRUMENTS = "INSTRUMENTS"
}

export type InstrumentStatusByIdWallet = {
  [idWallet: string]: pot.Pot<InstrumentStatusEnum | undefined, Error>;
};

export const IbanSchema = z
  .string()
  .regex(/^[a-zA-Z]{2}["\d]{2}[a-zA-Z0-9]{1,30}$/);
