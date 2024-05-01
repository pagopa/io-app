import { GlobalEvents } from "../../../../xstate/types/events";
import * as Input from "./input";

export interface AutoInit {
  readonly type: "xstate.init";
  readonly input: Input.Input;
}

export interface ConfirmUnsubscription {
  readonly type: "confirm-unsubscription";
}

export type Events = GlobalEvents | AutoInit | ConfirmUnsubscription;
