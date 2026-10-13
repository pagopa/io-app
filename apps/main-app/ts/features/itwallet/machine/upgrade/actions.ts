import { ActionArgs, assertEvent } from "xstate";

import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { itwKeyAttestationsStore } from "../../walletInstance/store/actions";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";

export const storeCredentialAction = ({
  context,
  event
}: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) => {
  assertEvent(event, "xstate.done.actor.upgradeCredential");
  const { credentialType, credentials, keyAttestations } = event.output;
  const { store } = context.deps;
  // The upgraded credentials replace the owned ones, so they must keep the
  // channel the original credential was obtained from, for analytics attribution.
  const { origin } =
    context.credentials.find(c => c.credentialType === credentialType) ?? {};
  const credentialsWithOrigin = credentials.map(bundle => ({
    ...bundle,
    metadata: { ...bundle.metadata, origin }
  }));
  // Removes old credentials and stores the new ones atomically
  store.dispatch(itwCredentialsReplaceByType(credentialsWithOrigin, {}));
  // Stores Key Attestations separately
  store.dispatch(itwKeyAttestationsStore(keyAttestations));
};

export const handleSessionExpiredAction = ({
  context
}: ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>) =>
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );
