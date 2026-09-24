import { deleteKey } from "@pagopa/io-react-native-crypto";
import { call, put, select } from "typed-redux-saga/macro";

import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import { shouldRefillBatch } from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialKeyTags } from "../../common/utils/itwCredentialUtils";
import { trackItwVaultCredentialRemoveFailed } from "../analytics";
import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsConsumeInstance,
  itwCredentialsRemove,
  itwCredentialsStore
} from "../store/actions";
import { itwAllStoredCredentialsSelector } from "../store/selectors";
import { CredentialsVault } from "../utils/vault";

/**
 * Consumes one presented copy of a batch-issued credential (e.g. Proof of Age)
 * after a successful remote presentation, as required by the IT-Wallet spec:
 * the consumed copy is removed from the vault and its crypto key deleted, and
 * the credential's `keyTags` are reduced by one to decrease the batch count.
 * When the consumed copy was the last one, the credential is fully removed
 * instead (mirroring `itwCredentialsRemoveByType`).
 *
 * Storage cleanup is best-effort: if it fails for one instance, the failure is
 * only tracked via analytics and processing continues with the remaining
 * instances, since the presentation has already succeeded from the Relying
 * Party's perspective by the time this saga runs.
 */
export function* handleItwCredentialsConsumeInstanceSaga(
  action: ReturnType<typeof itwCredentialsConsumeInstance>
) {
  const credentials = yield* select(itwAllStoredCredentialsSelector);

  for (const { credentialId, keyTag } of action.payload) {
    const credential = credentials.find(c => c.credentialId === credentialId);
    if (!credential) {
      continue;
    }

    try {
      yield* call(CredentialsVault.remove, keyTag);
      yield* call(deleteKey, keyTag);
    } catch (e) {
      trackItwVaultCredentialRemoveFailed({
        credential_ids: [credentialId],
        reason:
          e instanceof Error
            ? e.message
            : `Unknown error while removing vault credential for keyTag ${keyTag}`
      });

      // Best-effort: skip this instance
      continue;
    }

    const remainingKeyTags = getCredentialKeyTags(credential).filter(
      tag => tag !== keyTag
    );

    if (remainingKeyTags.length > 0) {
      // Copies remain: rotate the representative copy and decrease the batch count
      const updated = {
        ...credential,
        keyTag: remainingKeyTags[0],
        keyTags: remainingKeyTags
      };

      yield* put(itwCredentialsStore([updated]));

      // The pool reached the refill threshold: ask for a silent renewal. This is a fire-and-forget
      // side effect of a presentation that already succeeded, so it can neither delay nor fail it.
      if (shouldRefillBatch(updated)) {
        yield* put(
          itwCredentialsBatchRefillRequest({
            credentialType: updated.credentialType,
            trigger: "presentation"
          })
        );
      }
    } else {
      // The last copy was just consumed: fully remove the credential.
      yield* put(itwCredentialsRemove([credential]));
      yield* put(walletRemoveCards([`ITW_${credential.credentialType}`]));
    }
  }
}
