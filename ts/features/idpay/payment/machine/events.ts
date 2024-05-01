import { GlobalEvents } from "../../../../xstate/types/events";

export interface AuthorizePayment {
  readonly type: "authorize-payment";
  readonly trxCode: string;
}

export type Events = GlobalEvents | AuthorizePayment;
