import { call, put } from "typed-redux-saga/macro";

import {
  CredentialBundle,
  CredentialMetadata
} from "../../common/utils/itwTypesUtils";
import { trackItwVaultCredentialStoreFailed } from "../analytics";
import {
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { CredentialsVault } from "../utils/vault";

type VaultWrite = { credential: string; vaultId: string };

/**
 * Groups the obtained bundles by credentialId and produces, for each credentialId:
 * - the vault writes (one entry for a single credential, one per copy for a batch credential);
 * - the single metadata to store in Redux. A batch credential collapses into one metadata that
 *   lists all its copies' keyTags in `keyTags` (the first copy is the representative).
 */
const collapseBundles = (bundles: ReadonlyArray<CredentialBundle>) => {
  const groups = bundles.reduce<Record<string, Array<CredentialBundle>>>(
    (acc, bundle) => {
      const id = bundle.metadata.credentialId;
      return { ...acc, [id]: [...(acc[id] ?? []), bundle] };
    },
    {}
  );

  return Object.entries(groups).reduce<{
    metadata: Array<CredentialMetadata>;
    writes: Array<VaultWrite>;
  }>(
    (acc, [credentialId, group]) => {
      if (group.length === 1) {
        const [{ metadata, credential }] = group;
        // Non-batch credential: stored under its credentialId.
        return {
          writes: [...acc.writes, { vaultId: credentialId, credential }],
          metadata: [...acc.metadata, metadata]
        };
      }

      // Batch credential: each copy stored under its own keyTag.
      const keyTags = group.map(({ metadata }) => metadata.keyTag);
      const batchWrites = group.map(({ metadata, credential }) => ({
        vaultId: metadata.keyTag,
        credential
      }));

      return {
        writes: [...acc.writes, ...batchWrites],
        metadata: [...acc.metadata, { ...group[0].metadata, keyTags }]
      };
    },
    { writes: [], metadata: [] }
  );
};

/**
 * This saga handles the credential store action and ensures the consistency between
 * secure storage and redux store.
 */
export function* handleItwCredentialsStoreBundleSaga(
  action: ReturnType<typeof itwCredentialsStoreBundle>
) {
  const credentials = action.payload;
  const { onComplete, onError } = action.meta;

  try {
    const { writes, metadata } = collapseBundles(credentials);

    yield* call(() => CredentialsVault.storeAll(writes));

    // If all credentials are stored successfully, we can dispatch the action to add them to the store and wallet
    yield* put(itwCredentialsStore(metadata));

    onComplete?.();
  } catch (e) {
    const error = e instanceof Error ? e : new Error("Unknown error");

    trackItwVaultCredentialStoreFailed({
      credential_ids: credentials.map(({ metadata }) => metadata.credentialId),
      reason: error.message
    });

    onError?.(e instanceof Error ? e : new Error("Unknown error"));
  }
}
