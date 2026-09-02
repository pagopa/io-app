import { ActionArgs, assertEvent } from "xstate";

import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { itwWalletUnitAttestationsStore } from "../../walletInstance/store/actions";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";

export const storeCredentialAction = ({
  context,
  event
}: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
  assertEvent(event, "xstate.done.actor.upgradeCredential");
  const { credentials, walletUnitAttestations } = event.output;
  const { store } = context.deps;
  // Removes old credentials and stores the new ones atomically
  store.dispatch(itwCredentialsReplaceByType(credentials, {}));
  // Stores WUAs separately
  store.dispatch(itwWalletUnitAttestationsStore(walletUnitAttestations));
};

export const handleSessionExpiredAction = ({
  context
}: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) =>
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );
