import { ActionArgs, assertEvent } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: ({
    event
  }: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
    assertEvent(
      event,
      "xstate.done.actor.0.itwCredentialUpgradeMachine.UpgradeCredential"
    );
    const { credentialType, credentials } = event.output;
    // Removes old credential using the credential type
    store.dispatch(itwCredentialsRemoveByType(credentialType));
    // Stores the new credentials
    store.dispatch(itwCredentialsStore(credentials));
  }
});
