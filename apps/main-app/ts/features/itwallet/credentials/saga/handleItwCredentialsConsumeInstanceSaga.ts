import { deleteKey } from "@pagopa/io-react-native-crypto";
import { call, put, select } from "typed-redux-saga/macro";

import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import { getCredentialKeyTags } from "../../common/utils/itwCredentialUtils";
import { trackItwVaultCredentialRemoveFailed } from "../analytics";
import {
  itwCredentialsConsumeInstance,
  itwCredentialsRemove,
  itwCredentialsStore
} from "../store/actions";
import { itwAllStoredCredentialsSelector } from "../store/selectors";
import { CredentialsVault } from "../utils/vault";

/**
 * Consumes one presented copy of a batch-issued credential (e.g. Proof of Age) after a
 * successful remote presentation, as required by the IT-Wallet spec: the consumed copy is
 * removed from the vault and its crypto key deleted, and the credential's `keyTags` are reduced
 * by one to decrease the batch count. When the consumed copy was the last one, the credential is
 * fully removed instead (mirroring `itwCredentialsRemoveByType`).
 *
 * Storage cleanup is best-effort: if it fails for one instance, the failure is only tracked via
 * analytics and processing continues with the remaining instances, since the presentation has
 * already succeeded from the Relying Party's perspective by the time this saga runs.
 * @param itwCredentialsConsumeInstance
 */
export function* handleItwCredentialsConsumeInstanceSaga(
  action: ReturnType<typeof itwCredentialsConsumeInstance>
) {
  const instances = action.payload;
  const { onComplete, onError } = action.meta;

  try {
    const credentials = yield* select(itwAllStoredCredentialsSelector);

    for (const { credentialId, keyTag } of instances) {
      const credential = credentials.find(c => c.credentialId === credentialId);
      if (!credential) {
        continue;
      }

      try {
        yield* call(CredentialsVault.remove, keyTag);
        yield* call(deleteKey, keyTag);
      } catch (e) {
        const error =
          e instanceof Error
            ? e
            : new Error(
                `Unknown error while removing vault credential for keyTag ${keyTag}`
              );

        trackItwVaultCredentialRemoveFailed({
          credential_ids: [credentialId],
          reason: error.message
        });

        // Best-effort: skip this instance, the app state stays untouched for it.
        continue;
      }

      const remainingKeyTags = getCredentialKeyTags(credential).filter(
        tag => tag !== keyTag
      );

      if (remainingKeyTags.length > 0) {
        // Copies remain: rotate the representative copy and decrease the batch count.
        yield* put(
          itwCredentialsStore([
            {
              ...credential,
              keyTag: remainingKeyTags[0],
              keyTags: remainingKeyTags
            }
          ])
        );
      } else {
        // The last copy was just consumed: fully remove the credential and its Wallet card.
        yield* put(itwCredentialsRemove([credential]));
        yield* put(walletRemoveCards([`ITW_${credential.credentialType}`]));
      }
    }

    onComplete?.();
  } catch (e) {
    onError?.(
      e instanceof Error
        ? e
        : new Error("Unknown error while consuming presented batch credentials")
    );
  }
}
