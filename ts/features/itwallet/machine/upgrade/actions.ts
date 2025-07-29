import { ActionArgs, DoneActorEvent } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { UpgradeCredentialOutput } from "./actors";
import { Context } from "./context";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: ({
    event
  }: ActionArgs<
    Context,
    DoneActorEvent<UpgradeCredentialOutput, string>,
    DoneActorEvent<UpgradeCredentialOutput, string>
  >) => {
    const { credentialType, credentials } = event.output;
    // Removes old credential using the credential type
    store.dispatch(itwCredentialsRemoveByType(credentialType));
    // Stores the new credentials
    store.dispatch(itwCredentialsStore(credentials));
  }
});
