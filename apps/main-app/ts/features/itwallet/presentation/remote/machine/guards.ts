import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

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

export const isItWalletL3ActiveGuard = ({ context }: GuardArgs) => {
  const state = context.deps.store.getState();
  return (
    isItwEnabledSelector(state) &&
    itwIsL3EnabledSelector(state) &&
    itwLifecycleIsITWalletValidSelector(state)
  );
};

export const hasValidWalletInstanceAttestationGuard = ({
  context
}: GuardArgs) => {
  const walletAttestation = itwWalletInstanceAttestationSelector(
    context.deps.store.getState()
  );
  return pipe(
    O.fromNullable(walletAttestation?.jwt),
    O.map(attestation =>
      isWalletInstanceAttestationValid(context.deps.itwVersion, attestation)
    ),
    O.getOrElse(() => false)
  );
};

export const isSessionExpiredGuard = ({ event }: GuardArgs) =>
  "error" in event && event.error instanceof ItwSessionExpiredError;

/**
 * Valid OpenID Federation clients:
 * - `openid_federation:https://rp.example`
 * - `https://rp.example` (no prefix)
 */
export const isOpenIdFederationClientGuard = ({ context }: GuardArgs) =>
  Boolean(
    context.payload?.client_id.startsWith(ClientIdPrefix.OPENID_FEDERATION) ||
    context.payload?.client_id.startsWith("https://")
  );

export const isX509HashClientGuard = ({ context }: GuardArgs) =>
  Boolean(context.payload?.client_id.startsWith(ClientIdPrefix.X509_HASH));
