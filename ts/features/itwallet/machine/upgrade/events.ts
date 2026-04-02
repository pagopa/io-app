import { DoneActorEvent, ErrorActorEvent } from "xstate";

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};

export type CredentialUpgradeEvents =
  | SessionRefreshComplete
  | DoneActorEvent
  | ErrorActorEvent;
