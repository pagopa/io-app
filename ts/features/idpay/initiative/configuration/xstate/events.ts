import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
import { ConfigurationMode } from "./context";

type E_START_CONFIGURATION = {
  type: "START_CONFIGURATION";
  initiativeId: string;
  mode: ConfigurationMode;
};

type E_NEW_INSTRUMENT_ONBOARDING = {
  type: "NEW_INSTRUMENT_ONBOARDING";
};

type E_ENROLL_INSTRUMENT = {
  type: "ENROLL_INSTRUMENT";
  instrumentId: string;
};

type E_DELETE_INSTRUMENT = {
  type: "DELETE_INSTRUMENT";
  instrumentId: string;
};

type E_RELOAD_INSTRUMENTS = {
  type: "RELOAD_INSTRUMENTS";
};

type E_NEW_IBAN_ONBOARDING = {
  type: "NEW_IBAN_ONBOARDING";
};

type E_CONFIRM_IBAN = {
  type: "CONFIRM_IBAN";
  ibanBody: {
    iban: string;
    description: string;
  };
};

type E_ENROLL_IBAN = {
  type: "ENROLL_IBAN";
  iban: IbanDTO;
};

type E_COMPLETE_CONFIGURATION = {
  type: "COMPLETE_CONFIGURATION";
};

type E_NEXT = {
  type: "NEXT";
};

type E_BACK = {
  type: "BACK";
};

type E_QUIT = {
  type: "QUIT";
};

export type Events =
  | E_START_CONFIGURATION
  | E_NEW_INSTRUMENT_ONBOARDING
  | E_ENROLL_INSTRUMENT
  | E_DELETE_INSTRUMENT
  | E_RELOAD_INSTRUMENTS
  | E_NEW_IBAN_ONBOARDING
  | E_CONFIRM_IBAN
  | E_ENROLL_IBAN
  | E_COMPLETE_CONFIGURATION
  | E_NEXT
  | E_BACK
  | E_QUIT;
