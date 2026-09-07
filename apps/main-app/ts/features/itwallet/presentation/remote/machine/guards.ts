import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { useIOStore } from "../../../../../store/hooks.ts";
import { ItwSessionExpiredError } from "../../../api/client.ts";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors";
import { isItwEnabledSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors/index.ts";
import { ClientIdPrefix } from "../utils/itwRemotePresentationUtils";
import { Context } from "./context.ts";
import { RemoteEvents } from "./events.ts";

type GuardArgs = {
  context: Context;
  event: RemoteEvents;
};

export const createRemoteGuardsImplementation = (
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => ({
  isItWalletL3Active: () =>
    isItwEnabledSelector(store.getState()) &&
    itwIsL3EnabledSelector(store.getState()) &&
    itwLifecycleIsITWalletValidSelector(store.getState()),

  hasValidWalletInstanceAttestation: () => {
    const attestation = itwWalletInstanceAttestationSelector(
      store.getState()
    )?.jwt;
    return (
      attestation !== undefined &&
      isWalletInstanceAttestationValid(itwVersion, attestation)
    );
  },

  isSessionExpired: ({ event }: GuardArgs) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  /**
   * Valid OpenID Federation clients:
   * - `openid_federation:https://rp.example`
   * - `https://rp.example` (no prefix)
   */
  isOpenIdFederationClient: ({ context }: GuardArgs) =>
    Boolean(
      context.payload?.client_id.startsWith(ClientIdPrefix.OPENID_FEDERATION) ||
      context.payload?.client_id.startsWith("https://")
    ),

  isX509HashClient: ({ context }: GuardArgs) =>
    Boolean(context.payload?.client_id.startsWith(ClientIdPrefix.X509_HASH))
});
