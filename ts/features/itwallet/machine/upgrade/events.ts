import { DoneActorEvent, ErrorActorEvent } from "xstate";

export type CredentialUpgradeEvents = DoneActorEvent | ErrorActorEvent;
