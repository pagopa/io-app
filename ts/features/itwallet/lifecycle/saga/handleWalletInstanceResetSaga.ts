import { all, put, select } from "typed-redux-saga/macro";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import { itwCredentialsSelector } from "../../credentials/store/selectors";
import { itwLifecycleStoresReset } from "../store/actions";
import { walletRemoveCardsByType } from "../../../wallet/store/actions/cards";
import { isIos } from "../../../../utils/platform";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { updatePropertiesWalletRevoked } from "../../analytics";
import { GlobalState } from "../../../../store/reducers/types";

const getKeyTag = (credential: O.Option<StoredCredential>) =>
  pipe(
    credential,
    O.map(x => x.keyTag)
  );

export function* handleWalletInstanceResetSaga() {
  const state: GlobalState = yield* select();
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);
  const { eid, credentials } = yield* select(itwCredentialsSelector);

  yield* put(itwLifecycleStoresReset());
  yield* put(walletRemoveCardsByType("itw"));

  // Remove all keys within the wallet.
  // On iOS skip the integrity key tag as it is managed by the App Attest service.
  const itwKeyTags = pipe(
    [
      isIos ? O.none : integrityKeyTag,
      getKeyTag(eid),
      ...credentials.map(getKeyTag)
    ],
    RA.filterMap(identity)
  );
  yield* all(itwKeyTags.map(deleteKey));
  // Update every mixpanel property related to the wallet instance and its credentials.
  void updatePropertiesWalletRevoked(state);
}
