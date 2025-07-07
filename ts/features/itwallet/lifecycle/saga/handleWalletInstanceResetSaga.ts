import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as Sentry from "@sentry/react-native";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { identity, pipe } from "fp-ts/lib/function";
import { all, put, select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { isIos } from "../../../../utils/platform";
import { walletRemoveCardsByCategory } from "../../../wallet/store/actions/cards";
import { updatePropertiesWalletRevoked } from "../../analytics";
import { itwSetWalletInstanceRemotelyActive } from "../../common/store/actions/preferences.ts";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  itwCredentialsSelector,
  itwCredentialsEidSelector
} from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../store/actions";

const getKeyTag = (credential: O.Option<StoredCredential>) =>
  pipe(
    credential,
    O.map(x => x.keyTag)
  );

export function* handleWalletInstanceResetSaga() {
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);
  const eid = yield* select(itwCredentialsEidSelector);
  const credentials = yield* select(itwCredentialsSelector);

  try {
    yield* put(itwLifecycleStoresReset());
    yield* put(walletRemoveCardsByCategory("itw"));
    // Set the remote wallet instance as inactive since it has been revoked on the server.
    yield* put(itwSetWalletInstanceRemotelyActive(false));

    // Remove all keys within the wallet.
    // On iOS skip the integrity key tag as it is managed by the App Attest service.
    const itwKeyTags = pipe(
      [
        isIos ? O.none : integrityKeyTag,
        getKeyTag(eid),
        ...Object.values(credentials).map(O.some).map(getKeyTag)
      ],
      RA.filterMap(identity)
    );
    yield* all(itwKeyTags.map(deleteKey));
    // Update every mixpanel property related to the wallet instance and its credentials.
    const state: GlobalState = yield* select();
    void updatePropertiesWalletRevoked(state);
  } catch (e) {
    Sentry.captureException(e);
  }
}
