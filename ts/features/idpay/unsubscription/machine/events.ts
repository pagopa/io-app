import * as Input from "./input";

export interface AutoInit {
  readonly type: "xstate.init";
  readonly input: Input.Input;
}

export interface Exit {
  readonly type: "exit";
}

export interface ConfirmUnsubscription {
  readonly type: "confirm-unsubscription";
}

export type Events = AutoInit | Exit | ConfirmUnsubscription;
