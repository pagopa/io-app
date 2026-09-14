import { deleteKey } from "@pagopa/io-react-native-crypto";
import { all, call, put, select } from "typed-redux-saga/macro";

import { isIos } from "../../../../utils/platform";
import { walletRemoveCardsByCategory } from "../../../wallet/store/actions/cards";
import { updatePropertiesWalletRevoked } from "../../analytics/properties/propertyUpdaters.ts";
import {
  itwCredentialsEidSelector,
  itwCredentialsSelector
} from "../../credentials/store/selectors";
import { CredentialsVault } from "../../credentials/utils/vault";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../walletInstance/store/actions";
import { trackItwWalletInstanceResetFailure } from "../analytics";
import { itwLifecycleStoresReset } from "../store/actions";

export function* handleWalletInstanceResetSaga() {
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);
  const eid = yield* select(itwCredentialsEidSelector);
  const credentials = yield* select(itwCredentialsSelector);

  try {
    yield* put(itwLifecycleStoresReset());
    yield* put(walletRemoveCardsByCategory("itw"));
    // Set the remote wallet instance as inactive since it has been revoked on the server.
    yield* put(itwSetWalletInstanceRemotelyActive(false));

    // Clear all credentials from the secure storage vault
    yield* call(CredentialsVault.clear);

    // Remove all keys within the wallet.
    // On iOS skip the integrity key tag as it is managed by the App Attest service.
    const itwKeyTags = [
      isIos ? undefined : integrityKeyTag,
      eid?.keyTag,
      ...Object.values(credentials).map(c => c.keyTag)
    ].filter((keyTag): keyTag is string => keyTag !== undefined);
    yield* all(itwKeyTags.map(deleteKey));
    // Update every mixpanel property related to the wallet instance and its credentials.
    void updatePropertiesWalletRevoked();
  } catch (error) {
    trackItwWalletInstanceResetFailure(error);
  }
}
