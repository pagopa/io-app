import { ActionArgs, DoneActorEvent } from "xstate";

import { useIOStore } from "../../../../store/hooks";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { UpgradeCredentialOutput } from "./actors";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: ({
    event
  }: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
    const doneEvent = event as DoneActorEvent<UpgradeCredentialOutput>;
    const { credentialType, credentials } = doneEvent.output;
    // Removes old credential using the credential type
    store.dispatch(itwCredentialsRemoveByType(credentialType));
    // Stores the new credentials
    store.dispatch(itwCredentialsStore(credentials));
  }
});
