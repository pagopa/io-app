import { put } from "typed-redux-saga/macro";

import { walletAddCards } from "../../../wallet/store/actions/cards";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { mapCredentialToWalletCard } from "../../wallet/utils";
import { itwCredentialsStore } from "../store/actions";
import { pickCredentialsToDisplay } from "../utils/format";

/**
 * This saga handles the credential store action and ensures the consistency
 * between stored credentials and wallet state.
 */
export function* handleItwCredentialsStoreSaga(
  action: ReturnType<typeof itwCredentialsStore>
) {
  // A credential may be stored in multiple formats at once (e.g. SD-JWT and mDoc) but the wallet
  // renders a single card per type. Only the credential in the display format is mapped, otherwise
  // the card status would depend on the payload order and could be computed on a format whose
  // claims differ from the one shown in the credential details.
  const credentialsToAdd = pickCredentialsToDisplay(
    action.payload.filter(c => c.credentialType !== CredentialType.PID)
  );

  yield* put(walletAddCards(credentialsToAdd.map(mapCredentialToWalletCard)));
}
