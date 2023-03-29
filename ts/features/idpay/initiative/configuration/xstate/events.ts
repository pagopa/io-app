import { IbanDTO } from "../../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../../definitions/idpay/IbanPutDTO";
import { InstrumentDTO } from "../../../../../../definitions/idpay/InstrumentDTO";
import { Wallet } from "../../../../../types/pagopa";
import { ConfigurationMode } from "./context";

type E_START_CONFIGURATION = {
  type: "START_CONFIGURATION";
  initiativeId: string;
  mode: ConfigurationMode;
};

type E_STAGE_INSTRUMENT = {
  type: "STAGE_INSTRUMENT";
  instrument?: Wallet;
};

type E_ENROLL_INSTRUMENT = {
  type: "ENROLL_INSTRUMENT";
};

type E_DELETE_INSTRUMENT = {
  type: "DELETE_INSTRUMENT";
  instrument: InstrumentDTO;
};

type E_ADD_PAYMENT_METHOD = {
  type: "ADD_PAYMENT_METHOD";
};

type E_NEW_IBAN_ONBOARDING = {
  type: "NEW_IBAN_ONBOARDING";
};

type E_CONFIRM_IBAN = {
  type: "CONFIRM_IBAN";
  ibanBody: IbanPutDTO;
};

type E_ENROLL_IBAN = {
  type: "ENROLL_IBAN";
  iban: IbanDTO;
};

type E_COMPLETE_CONFIGURATION = {
  type: "COMPLETE_CONFIGURATION";
};

type E_SKIP = {
  type: "SKIP";
};

type E_NEXT = {
  type: "NEXT";
};

type E_BACK = {
  type: "BACK";
  skipNavigation?: boolean;
};

type E_QUIT = {
  type: "QUIT";
};

export type Events =
  | E_START_CONFIGURATION
  | E_STAGE_INSTRUMENT
  | E_ENROLL_INSTRUMENT
  | E_DELETE_INSTRUMENT
  | E_ADD_PAYMENT_METHOD
  | E_NEW_IBAN_ONBOARDING
  | E_CONFIRM_IBAN
  | E_ENROLL_IBAN
  | E_COMPLETE_CONFIGURATION
  | E_SKIP
  | E_NEXT
  | E_BACK
  | E_QUIT;
