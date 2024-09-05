import { put } from "typed-redux-saga/macro";
import { walletAddCards } from "../../../newWallet/store/actions/cards";
import { itwCredentialsStore } from "../store/actions";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsStoreSaga({
  payload
}: ReturnType<typeof itwCredentialsStore>) {
  const credentials = Array.isArray(payload) ? payload : [payload];

  yield* put(
    walletAddCards(
      credentials.map(c => ({
        key: `ITW_${c.credentialType}`,
        type: "itw",
        category: "itw",
        credentialType: c.credentialType,
        status: getCredentialStatus(c)
      }))
    )
  );
}
