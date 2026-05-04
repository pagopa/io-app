import { Appearance } from "react-native";
import { call, select } from "typed-redux-saga/macro";
import { preloadCredentialCardAssets } from "../../common/components/ItwCredentialCard/config";
import { itwCredentialsAllSelector } from "../../credentials/store/selectors";

/**
 * This saga preloads the assets for all credentials stored in the IT Wallet,
 * to ensure they are available when needed.
 */
export function* handleItwAssetsPreloadSaga() {
  const credentials = yield* select(itwCredentialsAllSelector);

  yield* call(
    preloadCredentialCardAssets,
    Object.values(credentials).map(c => c.credentialType),
    Appearance.getColorScheme()
  );
}
