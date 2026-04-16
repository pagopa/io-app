import { put } from "typed-redux-saga/macro";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { itwCredentialsStore } from "../store/actions";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { mapCredentialToWalletCard } from "../../wallet/utils";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 */
export function* handleItwCredentialsStoreSaga(
  action: ReturnType<typeof itwCredentialsStore>
) {
  const credentialsToAdd = action.payload.filter(
    c => c.credentialType !== CredentialType.PID
  );

  yield* put(walletAddCards(credentialsToAdd.map(mapCredentialToWalletCard)));
}
