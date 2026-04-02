import { DoneActorEvent, ErrorActorEvent } from "xstate";
import { UpgradeCredentialOutput } from "./actors";

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};

export type CredentialUpgradeEvents =
  | SessionRefreshComplete
  | DoneActorEvent<UpgradeCredentialOutput, "upgradeCredential">
  | ErrorActorEvent;
