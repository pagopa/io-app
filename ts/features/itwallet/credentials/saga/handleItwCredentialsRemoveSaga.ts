import { put } from "typed-redux-saga/macro";
import { walletRemoveCards } from "../../../newWallet/store/actions/cards";
import { itwCredentialsRemove } from "../store/actions";

/**
 * This saga handles the credential removal action and ensures the consistency between stored credentials and wallet state.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsRemoveSaga(
  itwCredentialsRemoveAction: ReturnType<typeof itwCredentialsRemove>
) {
  const { keyTag } = itwCredentialsRemoveAction.payload;
  yield* put(walletRemoveCards([keyTag]));
}
