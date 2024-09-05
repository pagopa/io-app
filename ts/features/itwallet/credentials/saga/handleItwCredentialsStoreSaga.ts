import { put } from "typed-redux-saga/macro";
import { walletUpsertCard } from "../../../newWallet/store/actions/cards";
import { itwCredentialsStore } from "../store/actions";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsStoreSaga(
  itwCredentialsStoreAction: ReturnType<typeof itwCredentialsStore>
) {
  const credential = itwCredentialsStoreAction.payload;
  yield* put(
    walletUpsertCard({
      key: credential.keyTag,
      type: "itw",
      category: "itw",
      credentialType: credential.credentialType,
      status: getCredentialStatus(credential)
    })
  );
}
