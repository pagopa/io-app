import { ActionArgs, assertEvent } from "xstate";

import { useIOStore } from "../../../../store/hooks";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { itwKeyAttestationsStore } from "../../walletInstance/store/actions";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: ({
    event
  }: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
    assertEvent(event, "xstate.done.actor.upgradeCredential");
    const { credentials, keyAttestations } = event.output;
    // Removes old credentials and stores the new ones atomically
    store.dispatch(itwCredentialsReplaceByType(credentials, {}));
    // Stores Key Attestations separately
    store.dispatch(itwKeyAttestationsStore(keyAttestations));
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
