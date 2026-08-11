import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";

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
  getEffectiveBatchSize,
  obtainCredentialsBatch,
  requestCredential,
  shouldRefillBatch
} from "../../common/utils/itwCredentialIssuanceUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { CredentialBundle } from "../../common/utils/itwTypesUtils";
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
  itwCredentialsReplaceByType
} from "../store/actions";
import {
  itwCredentialsEidSelector,
  itwCredentialsListByTypeSelector
} from "../store/selectors";
import { CredentialsVault } from "../utils/vault";
import { handleItwCredentialsReplaceByTypeSaga } from "./handleItwCredentialsReplaceByTypeSaga";

/**
 * Collects the Wallet Unit Attestations generated during the renewal, keyed by their id.
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
 * Silently renews the batch of a one-time-use credential (e.g. Proof of Age) that is down to its
 * refill threshold. It walks the standard issuance path headlessly: no navigation, no consent
 * prompt, no loader, since the consent given to the Issuer at first issuance still holds.
 *
 * The current pool stays untouched until the new batch is obtained and verified, then the two are
 * swapped atomically via `itwCredentialsReplaceByType`.
 *
 * Failures abort the renewal silently: the user keeps the residual copies and the next trigger
 * retries, as long as the pool is still under threshold.
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

    // The Issuer dropped batch support: renewing with a single copy would silently degrade the
    // pool, so skip the renewal entirely.
    if (batchSize <= 1) {
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

    const authorizedCredentials = yield* call(
      generateBatchKeysWithWalletUnitAttestation,
      accessToken,
      batchSize,
      {
        env,
        itwVersion,
        hardwareKeyTag: integrityKeyTag.value,
        sessionToken
      }
    );

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

    // Called instead of dispatched so that it completes before the WUAs are stored, and any
    // failure reaches the catch below.
    yield* call(
      handleItwCredentialsReplaceByTypeSaga,
      itwCredentialsReplaceByType(verifiedCredentials, {})
    );

    yield* put(
      itwWalletUnitAttestationsStore(
        extractWalletUnitAttestations(authorizedCredentials)
      )
    );
  } catch {
    // Silent by design: never surface a background failure nor touch the existing pool.
    return;
  }
}

/**
 * Returns a valid Wallet Instance Attestation, reusing the stored one when possible.
 *
 * Unlike the issuance machine, it does not attempt a wallet instance renewal on failure: a
 * background flow must not mutate the wallet instance behind the user's back.
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
