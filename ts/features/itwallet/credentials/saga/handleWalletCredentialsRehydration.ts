import { put, select } from "typed-redux-saga/macro";
import { identity, pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { itwCredentialsSelector } from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WalletCard } from "../../../newWallet/types";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { walletAddCards } from "../../../newWallet/store/actions/cards";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

const mapCredentialsToWalletCards = (
  credentials: Array<StoredCredential>
): Array<WalletCard> =>
  credentials.map(credential => ({
    key: credential.keyTag,
    type: "itw",
    category: "itw",
    credentialType: credential.credentialType as CredentialType
  }));

/**
 * This saga adds stored credentials to the wallet screen as cards.
 * It should be invoked as soon as possible to properly sync credentials to the wallet.
 */
export function* handleWalletCredentialsRehydration() {
  const isItWalletValid = yield* select(itwLifecycleIsValidSelector);
  const { eid, credentials } = yield* select(itwCredentialsSelector);

  // Only a valid wallet should contain credentials to display
  if (!isItWalletValid || O.isNone(eid)) {
    return;
  }

  const allItwCredentials = [
    eid.value,
    ...pipe(credentials, A.filterMap(identity))
  ];

  yield* put(walletAddCards(mapCredentialsToWalletCards(allItwCredentials)));
}
