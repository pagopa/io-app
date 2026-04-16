import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOStore } from "../../../../../store/hooks.ts";
import { ItwSessionExpiredError } from "../../../api/client.ts";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences.ts";
import { isItwEnabledSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils.ts";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors/index.ts";
import { RemoteEvents } from "./events.ts";

export const createRemoteGuardsImplementation = (
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => ({
  isItWalletL3Active: () =>
    isItwEnabledSelector(store.getState()) &&
    itwIsL3EnabledSelector(store.getState()) &&
    itwLifecycleIsITWalletValidSelector(store.getState()),

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  },

  hasValidWalletInstanceAttestation: () => {
    const walletAttestation = itwWalletInstanceAttestationSelector(
      store.getState()
    );
    return pipe(
      O.fromNullable(walletAttestation?.jwt),
      O.map(attestation =>
        isWalletInstanceAttestationValid(itwVersion, attestation)
      ),
      O.getOrElse(() => false)
    );
  },

  isSessionExpired: ({ event }: { event: RemoteEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError
});
