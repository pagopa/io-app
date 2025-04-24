import { put } from "typed-redux-saga/macro";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { itwCredentialsStore } from "../store/actions";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwSendExceptionToSentry } from "../../common/utils/itwSentryUtils";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsStoreSaga(
  itwCredentialsStoreAction: ReturnType<typeof itwCredentialsStore>
) {
  try {
    const credentialsToAdd = itwCredentialsStoreAction.payload.filter(
      c => c.credentialType !== CredentialType.PID
    );

    yield* put(
      walletAddCards(
        credentialsToAdd.map(c => ({
          key: `ITW_${c.credentialType}`,
          type: "itw",
          category: "itw",
          credentialType: c.credentialType,
          status: getCredentialStatus(c)
        }))
      )
    );
  } catch (e) {
    itwSendExceptionToSentry(e, "handleItwCredentialsStoreSaga");
  }
}
