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
  | E_ADD_INSTRUMENT
  | E_COMPLETE_CONFIGURATION
  | E_NEXT
  | E_BACK
  | E_QUIT;
