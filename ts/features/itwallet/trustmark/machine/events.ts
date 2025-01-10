import { ErrorActorEvent } from "xstate";

export type Retry = {
  type: "retry";
};

export type TrustmarkEvents = Retry | ErrorActorEvent;
