import { put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import {
  itwCredentialsSelector,
  itwCredentialsEidSelector
} from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WalletCard } from "../../../wallet/types";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";

const mapCredentialsToWalletCards = (
  credentials: Array<StoredCredential>
): Array<WalletCard> =>
  credentials.map(credential => ({
    key: `ITW_${credential.credentialType}`,
    type: "itw",
    category: "itw",
    credentialType: credential.credentialType as CredentialType,
    status: getCredentialStatus(credential)
  }));

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
  yield* put(walletAddCards(mapCredentialsToWalletCards(allItwCredentials)));
}
