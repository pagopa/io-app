import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { all, call, put, select } from "typed-redux-saga/macro";

import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import {
  getWalletInstanceAttestation,
  isWalletInstanceAttestationValid
} from "../../common/utils/itwAttestationUtils";
import {
  attachCredentialsStatus,
  completeAuthFlow,
  generateBatchKeysWithWalletUnitAttestation,
  getBatchRefillThreshold,
  getEffectiveBatchSize,
  obtainCredentialsBatch,
  requestCredential,
  shouldRefillBatch
} from "../../common/utils/itwCredentialIssuanceUtils";
import {
  getCredentialKeyTags,
  getCredentialVaultIds
} from "../../common/utils/itwCredentialUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import {
  CredentialBundle,
  CredentialMetadata,
  IssuerConfiguration
} from "../../common/utils/itwTypesUtils";
import {
  itwIntegrityKeyTagSelector,
  itwIntegrityServiceStatusSelector
} from "../../issuance/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import {
  itwWalletInstanceAttestationStore,
  itwWalletUnitAttestationsStore
} from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsRemove,
  itwCredentialsStoreBundle
} from "../store/actions";
import {
  itwCredentialsEidSelector,
  itwCredentialsListByTypeSelector
} from "../store/selectors";
import { CredentialsVault } from "../utils/vault";
import { handleItwCredentialsStoreBundleSaga } from "./handleItwCredentialsStoreBundleSaga";

type AuthorizedCredentials = Awaited<
  ReturnType<typeof generateBatchKeysWithWalletUnitAttestation>
>;

/**
 * Collects the Wallet Unit Attestations generated during the renewal, keyed by
 * their id.
 */
const extractWalletUnitAttestations = (
  authorizedCredentials: ReadonlyArray<{
    walletUnitAttestation?: string;
    walletUnitAttestationId?: string;
  }>
): Record<string, string> =>
  authorizedCredentials.reduce(
    (acc, c) =>
      c.walletUnitAttestationId && c.walletUnitAttestation
        ? { ...acc, [c.walletUnitAttestationId]: c.walletUnitAttestation }
        : acc,
    {} as Record<string, string>
  );

/**
 * Silently renews the batch of a one-time-use credential (e.g. Proof of Age)
 * that is down to its refill threshold. It walks the standard issuance path
 * headlessly: no navigation, no consent prompt, no loader, since the consent
 * given to the Issuer at first issuance still holds.
 *
 * The swap is store-then-discard: the residual copies stay usable until the new
 * pool is durably written to the vault, so an interrupted renewal can never
 * leave the user without a credential. The two pools share the same
 * `credentialId` (the Issuer's `credential_configuration_id`), so storing the
 * new metadata replaces the old one in Redux, while the old copies live under
 * their own vault ids and are discarded afterwards.
 *
 * Failures abort the renewal silently: the user keeps the residual copies and
 * the next trigger retries, as long as the pool is still under threshold.
 */
export function* handleItwCredentialsBatchRefillSaga(
  action: ReturnType<typeof itwCredentialsBatchRefillRequest>
) {
  const { credentialType } = action.payload;

  try {
    const isWalletValid = yield* select(itwLifecycleIsValidSelector);
    const isConnected = yield* select(isConnectedSelector);

    // A renewal is a full issuance, so it needs a valid wallet and connectivity.
    if (!isWalletValid || !isConnected) {
      return;
    }

    const storedCredentials = yield* select(
      itwCredentialsListByTypeSelector(credentialType)
    );

    // Re-check the threshold: a concurrent renewal may have already refilled the pool.
    if (!storedCredentials.some(shouldRefillBatch)) {
      return;
    }

    const sessionToken = yield* select(sessionTokenSelector);
    const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

    if (!sessionToken || O.isNone(integrityKeyTag)) {
      return;
    }

    const env = getEnv(yield* select(selectItwEnv));
    const itwVersion = yield* select(selectItwSpecsVersion);

    // The WUA needs the integrity service, warmed up at app start. Rather than waiting for it in
    // a background flow, postpone the renewal to the next trigger.
    if (getIoWallet(itwVersion).WalletUnitAttestation.isSupported) {
      const integrityServiceStatus = yield* select(
        itwIntegrityServiceStatusSelector
      );
      if (integrityServiceStatus !== "ready") {
        return;
      }
    }

    // The PID is presented to the Issuer to satisfy its DCQL query.
    const eidOption = yield* select(itwCredentialsEidSelector);
    if (O.isNone(eidOption)) {
      return;
    }
    const eid = eidOption.value;

    const pidCredential = yield* call(CredentialsVault.get, eid.credentialId);
    if (!pidCredential) {
      return;
    }

    const walletInstanceAttestation = yield* call(
      getValidWalletInstanceAttestation,
      env,
      itwVersion,
      integrityKeyTag.value,
      sessionToken
    );

    const isItWalletValid = yield* select(itwLifecycleIsITWalletValidSelector);

    const {
      clientId,
      codeVerifier,
      responseMode,
      requestedCredential,
      issuerConf,
      evaluatedDcqlQuery
    } = yield* call(requestCredential, {
      env,
      itwVersion,
      credentialType,
      walletInstanceAttestation: walletInstanceAttestation.jwt,
      // Do not request mDoc credentials for non IT-Wallet instances
      skipMdocIssuance: !isItWalletValid,
      pid: { metadata: eid, credential: pidCredential }
    });

    const batchSize = getEffectiveBatchSize(
      credentialType,
      issuerConf.credential_issuance_batch_size
    );
    const refillThreshold = getBatchRefillThreshold(credentialType);

    // Renewing with a single copy would silently degrade the pool, and a pool that does not
    // exceed its own refill threshold would ask to be renewed as soon as it is stored, looping a
    // full issuance on every trigger. In both cases skip the renewal entirely.
    if (
      batchSize <= 1 ||
      refillThreshold === undefined ||
      batchSize <= refillThreshold
    ) {
      return;
    }

    const { accessToken } = yield* call(completeAuthFlow, {
      env,
      itwVersion,
      codeVerifier,
      issuerConf,
      walletInstanceAttestation: walletInstanceAttestation.jwt,
      requestedCredential,
      responseMode,
      evaluatedDcqlQuery
    });

    const { authorizedCredentials, verifiedCredentials } = yield* call(
      obtainVerifiedBatch,
      {
        accessToken,
        batchSize,
        clientId,
        credentialType,
        env,
        hardwareKeyTag: integrityKeyTag.value,
        issuerConf,
        itwVersion,
        sessionToken
      }
    );

    // The residual copies are read again right before the swap: a presentation may have consumed
    // one while the issuance was in flight, and only the copies still stored must be discarded.
    const staleCredentials = yield* select(
      itwCredentialsListByTypeSelector(credentialType)
    );

    // Called instead of dispatched so that a persistence failure aborts the swap: until the new
    // pool is durably stored the residual copies are the only usable ones and must not be touched.
    yield* call(
      storeNewBatch,
      verifiedCredentials,
      authorizedCredentials.flatMap(({ keyTags }) => keyTags)
    );

    yield* put(
      itwWalletUnitAttestationsStore(
        extractWalletUnitAttestations(authorizedCredentials)
      )
    );

    yield* call(discardStaleCopies, staleCredentials, verifiedCredentials);
  } catch {
    // Silent by design: never surface a background failure nor touch the existing pool.
    return;
  }
}

/**
 * Deletes the given crypto keys from the device keystore, ignoring keys that
 * are already gone.
 */
function* deleteKeys(keyTags: ReadonlyArray<string>) {
  yield* all(
    keyTags.map(keyTag =>
      call(function* () {
        try {
          yield* call(deleteKey, keyTag);
        } catch {
          return;
        }
      })
    )
  );
}

/**
 * Discards the copies replaced by the renewal, removing their vault entries,
 * their Redux metadata and their crypto keys.
 *
 * Best effort by design: it runs after the new pool is durably stored, so a
 * failure here can only leave orphaned material behind, never an unusable
 * credential, and must not abort the renewal.
 */
function* discardStaleCopies(
  staleCredentials: ReadonlyArray<CredentialMetadata>,
  newCredentials: ReadonlyArray<CredentialBundle>
) {
  // Both pools share the same `credentialId`, so the new copies are told apart by their keyTags.
  const newKeyTags = new Set(
    newCredentials.map(({ metadata }) => metadata.keyTag)
  );
  const obsoleteCredentials = staleCredentials.filter(
    credential =>
      !getCredentialKeyTags(credential).some(keyTag => newKeyTags.has(keyTag))
  );

  if (obsoleteCredentials.length === 0) {
    return;
  }

  // `itwCredentialsRemove` deletes by `credentialId`, and the new pool is stored under the same
  // `credentialId` as the pool it replaces: removing the stale entry would wipe the metadata just
  // stored, leaving the user with no credential at all. Only ids the renewal did not overwrite
  // are removed from Redux; the others are already replaced by the new metadata.
  const overwrittenIds = new Set(
    newCredentials.map(({ metadata }) => metadata.credentialId)
  );
  const credentialsToRemove = obsoleteCredentials.filter(
    ({ credentialId }) => !overwrittenIds.has(credentialId)
  );

  try {
    yield* call(
      CredentialsVault.removeAll,
      obsoleteCredentials.flatMap(getCredentialVaultIds)
    );
    if (credentialsToRemove.length > 0) {
      yield* put(itwCredentialsRemove(credentialsToRemove));
    }
    yield* call(deleteKeys, obsoleteCredentials.flatMap(getCredentialKeyTags));
  } catch {
    return;
  }
}

/**
 * Returns a valid Wallet Instance Attestation, reusing the stored one when
 * possible.
 *
 * Unlike the issuance machine, it does not attempt a wallet instance renewal on
 * failure: a background flow must not mutate the wallet instance behind the
 * user's back.
 */
function* getValidWalletInstanceAttestation(
  env: ReturnType<typeof getEnv>,
  itwVersion: ReturnType<typeof selectItwSpecsVersion>,
  hardwareKeyTag: string,
  sessionToken: string
) {
  const storedAttestation = yield* select(itwWalletInstanceAttestationSelector);

  if (
    storedAttestation &&
    isWalletInstanceAttestationValid(itwVersion, storedAttestation.jwt)
  ) {
    return storedAttestation;
  }

  const attestation = yield* call(
    getWalletInstanceAttestation,
    env,
    itwVersion,
    hardwareKeyTag,
    sessionToken
  );

  yield* put(itwWalletInstanceAttestationStore(attestation));

  return attestation;
}

/**
 * Runs the part of the issuance that generates device keys, so that they never
 * outlive a failed renewal: any error deletes the freshly generated keys before
 * propagating, otherwise every retry would leave a full batch of orphaned keys
 * in the device keystore.
 *
 * Keys are retained only when the batch is obtained and verified, i.e. when it
 * is about to be stored and the keys become the ones backing the new pool.
 */
function* obtainVerifiedBatch(args: {
  accessToken: Awaited<ReturnType<typeof completeAuthFlow>>["accessToken"];
  batchSize: number;
  clientId: string;
  credentialType: string;
  env: ReturnType<typeof getEnv>;
  hardwareKeyTag: string;
  issuerConf: IssuerConfiguration;
  itwVersion: ReturnType<typeof selectItwSpecsVersion>;
  sessionToken: string;
}) {
  const {
    accessToken,
    batchSize,
    clientId,
    credentialType,
    env,
    hardwareKeyTag,
    issuerConf,
    itwVersion,
    sessionToken
  } = args;

  const authorizedCredentials: AuthorizedCredentials = yield* call(
    generateBatchKeysWithWalletUnitAttestation,
    accessToken,
    batchSize,
    { env, itwVersion, hardwareKeyTag, sessionToken }
  );

  try {
    const credentials: ReadonlyArray<CredentialBundle> = yield* call(
      obtainCredentialsBatch,
      {
        authorizedCredentials,
        env,
        itwVersion,
        accessToken,
        credentialType,
        issuerConf,
        clientId
      }
    );

    const verifiedCredentials = yield* call(attachCredentialsStatus, {
      credentials,
      env,
      itwVersion,
      issuerConf
    });

    return { authorizedCredentials, verifiedCredentials };
  } catch (e) {
    yield* call(
      deleteKeys,
      authorizedCredentials.flatMap(({ keyTags }) => keyTags)
    );
    throw e;
  }
}

/**
 * Stores the new pool, propagating any persistence failure to the caller.
 *
 * `handleItwCredentialsStoreBundleSaga` reports failures through `onError`
 * instead of throwing, so the callback rethrows: a swallowed failure here would
 * let the renewal discard the residual copies without a stored replacement. A
 * failed store leaves no metadata behind, so the keys generated for the new
 * pool are deleted as well.
 */
function* storeNewBatch(
  credentials: ReadonlyArray<CredentialBundle>,
  generatedKeyTags: ReadonlyArray<string>
) {
  try {
    yield* call(
      handleItwCredentialsStoreBundleSaga,
      itwCredentialsStoreBundle(credentials, {
        onError: error => {
          throw error;
        }
      })
    );
  } catch (e) {
    yield* call(deleteKeys, generatedKeyTags);
    throw e;
  }
}
