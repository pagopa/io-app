import { E_BACK } from "../../common/xstate/events";

type E_EXIT = {
  type: "EXIT";
};

type E_PRE_AUTHORIZE_PAYMENT = {
  type: "PRE_AUTHORIZE_PAYMENT";
  trxCode: string;
};

type E_AUTHORIZE_PAYMENT = {
  type: "AUTHORIZE_PAYMENT";
};

export type Events =
  | E_EXIT
  | E_BACK
  | E_PRE_AUTHORIZE_PAYMENT
  | E_AUTHORIZE_PAYMENT;
