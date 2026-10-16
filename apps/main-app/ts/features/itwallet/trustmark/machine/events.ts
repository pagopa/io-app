import { ErrorActorEvent } from "xstate";

export type TrustmarkEvents = ErrorActorEvent | Retry;

type Retry = {
  type: "retry";
};
