import { put } from "typed-redux-saga/macro";

import { walletAddCards } from "../../../wallet/store/actions/cards";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { mapCredentialToWalletCard } from "../../wallet/utils";
import { itwCredentialsStore } from "../store/actions";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsStoreSaga(
  itwCredentialsStoreAction: ReturnType<typeof itwCredentialsStore>
) {
  const credentialsToAdd = itwCredentialsStoreAction.payload.filter(
    c => c.credentialType !== CredentialType.PID
  );

  yield* put(walletAddCards(credentialsToAdd.map(mapCredentialToWalletCard)));
}
