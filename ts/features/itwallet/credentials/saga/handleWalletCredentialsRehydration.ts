import * as O from "fp-ts/lib/Option";
import { put, select } from "typed-redux-saga/macro";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { mapCredentialToWalletCard } from "../../wallet/utils";
import {
  itwCredentialsEidSelector,
  itwCredentialsSelector
} from "../store/selectors";

/**
 * This saga adds stored credentials to the wallet screen as cards.
 * It should be invoked as soon as possible to properly sync credentials to the wallet.
 */
export function* handleWalletCredentialsRehydration() {
  const isItWalletValid = yield* select(itwLifecycleIsValidSelector);
  const pid = yield* select(itwCredentialsEidSelector);
  const credentials = yield* select(itwCredentialsSelector);

  // Only a valid wallet should contain credentials to display
  if (!isItWalletValid || O.isNone(pid)) {
    return;
  }

  const allItwCredentials = Object.values(credentials);
  yield* put(walletAddCards(allItwCredentials.map(mapCredentialToWalletCard)));
}
