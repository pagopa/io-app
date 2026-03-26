import { ActionArgs, DoneActorEvent } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";
import { UpgradeCredentialOutput } from "./actors";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: ({
    event
  }: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
    const doneEvent = event as DoneActorEvent<UpgradeCredentialOutput>;
    const { credentials } = doneEvent.output;
    // Removes old credentials and stores the new ones atomically
    store.dispatch(itwCredentialsReplaceByType(credentials));
  }
});
