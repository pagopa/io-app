import { IbanDTO } from "../../../../../../definitions/idpay/iban/IbanDTO";
import { ConfigurationMode } from "./context";

type E_START_CONFIGURATION = {
  type: "START_CONFIGURATION";
  initiativeId: string;
  mode: ConfigurationMode;
};

type E_ADD_INSTRUMENT = {
  type: "ADD_INSTRUMENT";
  walletId: string;
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
type E_CONFIRM_IBAN = {
  type: "CONFIRM_IBAN";
  ibanBody: {
    iban: string;
    description: string;
  };
};

export type Events =
  | E_START_CONFIGURATION
  | E_ADD_INSTRUMENT
  | E_ENROLL_IBAN
  | E_COMPLETE_CONFIGURATION
  | E_NEXT
  | E_BACK
  | E_CONFIRM_IBAN
  | E_QUIT;
