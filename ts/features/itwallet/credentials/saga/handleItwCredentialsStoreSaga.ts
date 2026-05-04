import { Appearance } from "react-native";
import { call, put } from "typed-redux-saga/macro";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { preloadCredentialCardAssets } from "../../common/components/ItwCredentialCard/config";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { mapCredentialToWalletCard } from "../../wallet/utils";
import { itwCredentialsStore } from "../store/actions";

/**
 * This saga handles the credential store action and ensures the consistency between stored credentials and wallet state.
 */
export function* handleItwCredentialsStoreSaga(
  action: ReturnType<typeof itwCredentialsStore>
) {
  const credentialsToAdd = action.payload.filter(
    c => c.credentialType !== CredentialType.PID
  );

  yield* call(
    preloadCredentialCardAssets,
    credentialsToAdd.map(c => c.credentialType),
    Appearance.getColorScheme()
  );

  yield* put(walletAddCards(credentialsToAdd.map(mapCredentialToWalletCard)));
}
