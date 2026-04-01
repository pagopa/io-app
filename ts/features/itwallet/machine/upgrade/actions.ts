import { ActionArgs, DoneActorEvent } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { itwWalletUnitAttestationsStore } from "../../walletInstance/store/actions";
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
    const { credentialType, credentials } = doneEvent.output;
    // Removes old credential using the credential type
    store.dispatch(itwCredentialsRemoveByType(credentialType));
    // Stores the new credentials without the WUA
    store.dispatch(
      itwCredentialsStore(
        credentials.map(({ walletUnitAttestation, ...rest }) => rest)
      )
    );
    // Stores WUAs separately
    const walletUnitAttestations = credentials.reduce(
      (acc, c) =>
        c.walletUnitAttestation && c.walletUnitAttestationId
          ? { ...acc, [c.walletUnitAttestationId]: c.walletUnitAttestation }
          : acc,
      {} as Record<string, string>
    );
    store.dispatch(itwWalletUnitAttestationsStore(walletUnitAttestations));
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
