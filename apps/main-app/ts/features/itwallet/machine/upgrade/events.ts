import { DoneActorEvent, ErrorActorEvent } from "xstate";

import { UpgradeCredentialOutput } from "./actors";

export type CredentialUpgradeEvents =
  | DoneActorEvent<UpgradeCredentialOutput, "upgradeCredential">
  | ErrorActorEvent
  | SessionRefreshComplete;

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};
