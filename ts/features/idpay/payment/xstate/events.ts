import { E_BACK } from "../../common/xstate/events";

type E_EXIT = {
  type: "EXIT";
};

type E_START_AUTHORIZATION = {
  type: "START_AUTHORIZATION";
  trxCode: string;
};

type E_AUTHORIZE_PAYMENT = {
  type: "AUTHORIZE_PAYMENT";
};

export type Events =
  | E_EXIT
  | E_BACK
  | E_START_AUTHORIZATION
  | E_AUTHORIZE_PAYMENT;
