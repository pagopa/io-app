import { Errors } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";

import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getNetworkError } from "../../../../utils/errors";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { getWalletInstanceStatus } from "../../common/utils/itwAttestationUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { WalletInstanceRevocationReason } from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { ensureFreshStatusList } from "../../statusList/utils/refresh";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import { ItwWalletInstanceState } from "../../walletInstance/store/reducers";
import { itwWalletInstanceStatusListSelector } from "../../walletInstance/store/selectors";
import {
  trackItwStatusWalletAttestationFailure,
  trackItwWalletBadState,
  trackItwWalletInstanceRevocation
} from "../analytics";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { checkIntegrityServiceReadySaga } from "./checkIntegrityServiceReadySaga";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";

/**
 * The only Status List status that keeps the wallet instance alive.
 * Any other status revokes it, consistently with how credentials treat their own status list.
 */
const VALID_STATUS = "valid";

/**
 * Unlike the status assertion, the Status List carries no revocation reason.
 * A revoked entry always means the Wallet Provider revoked the instance, hence this reason
 * is assumed to show the user the same message as the status assertion flow.
 */
const STATUS_LIST_REVOCATION_REASON: WalletInstanceRevocationReason =
  "CERTIFICATE_REVOKED_BY_ISSUER";

/**
 * Saga responsible for checking wallet instance inconsistency.
 * If an eID is present but the integrity key tag is missing,
 * the wallet instance is reset.
 */
export function* checkWalletInstanceInconsistencySaga(): Generator<
  ReduxSagaEffect,
  boolean
> {
  const eid = yield* select(itwCredentialsEidSelector);
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

  if (O.isSome(eid) && O.isNone(integrityKeyTag)) {
    yield* call(handleWalletInstanceResetSaga);
    trackItwWalletBadState();
    return false;
  }

  return true;
}

/**
 * Saga responsible to check whether the wallet instance has not been revoked
 * or deleted. When this happens, the wallet is reset on the users's device.
 *
 * The status is read from the Wallet Unit Attestation's Status List when available [1.3.3+],
 * otherwise from the Wallet Provider's status endpoint [1.0.0].
 */
export function* checkWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  const isItwOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

  // Only operational or valid wallet instances can be revoked.
  if (!isItwOperationalOrValid || O.isNone(integrityKeyTag)) {
    return;
  }

  const itwVersion = yield* select(selectItwSpecsVersion);
  const statusListEntry = yield* select(itwWalletInstanceStatusListSelector);
  const isStatusListSupported =
    getIoWallet(itwVersion).CredentialStatus.statusList.isSupported;

  // The Status List does not involve the device integrity, so it is checked right away.
  if (statusListEntry && isStatusListSupported) {
    yield* call(
      getStatusListStatusOrResetWalletInstance,
      statusListEntry,
      integrityKeyTag.value
    );
    return;
  }

  // Wallet instances created before the Status List support still rely on the status endpoint,
  // which requires the integrity service to be ready.
  if (yield* call(checkIntegrityServiceReadySaga)) {
    yield* call(getStatusOrResetWalletInstance, integrityKeyTag.value);
  }
}

/**
 * [1.3.3+] Reads the wallet instance status from the Wallet Unit Attestation's Status List,
 * refreshing the cached token first when it is missing or stale, so the status is never
 * evaluated against outdated data.
 *
 * A non-valid entry resets the wallet, exactly as a revoked status assertion does.
 * When the Status List cannot be refreshed the status stays unknown: the wallet is left
 * untouched and the failure is stored, because being offline must not wipe a valid wallet.
 */
export function* getStatusListStatusOrResetWalletInstance(
  { idx, uri }: NonNullable<ItwWalletInstanceState["statusList"]>,
  integrityKeyTag: string
) {
  const itwVersion = yield* select(selectItwSpecsVersion);
  const statusListApi = getIoWallet(itwVersion).CredentialStatus.statusList;

  try {
    assert(
      statusListApi.isSupported,
      `Status List is not supported by API ${itwVersion}`
    );

    const statusList = yield* call(ensureFreshStatusList, { itwVersion }, uri);
    const { status } = statusListApi.getStatus(statusList.status_list, idx);
    const isRevoked = status.toLowerCase() !== VALID_STATUS;

    if (isRevoked) {
      trackItwWalletInstanceRevocation(STATUS_LIST_REVOCATION_REASON);
      yield* call(handleWalletInstanceResetSaga);
    }

    yield* put(
      itwUpdateWalletInstanceStatus.success({
        id: integrityKeyTag,
        is_revoked: isRevoked,
        ...(isRevoked && { revocation_reason: STATUS_LIST_REVOCATION_REASON })
      })
    );
  } catch (e) {
    trackItwStatusWalletAttestationFailure();
    yield* put(itwUpdateWalletInstanceStatus.failure(getNetworkError(e)));
  }
}

export function* getStatusOrResetWalletInstance(integrityKeyTag: string) {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const env = getEnv(yield* select(selectItwEnv));
  const itwVersion = yield* select(selectItwSpecsVersion);

  try {
    const walletInstanceStatus = yield* call(
      getWalletInstanceStatus,
      env,
      itwVersion,
      integrityKeyTag,
      sessionToken
    );

    if (walletInstanceStatus.is_revoked) {
      trackItwWalletInstanceRevocation(walletInstanceStatus.revocation_reason);
      yield* call(handleWalletInstanceResetSaga);
    }

    // Update wallet instance status
    yield* put(itwUpdateWalletInstanceStatus.success(walletInstanceStatus));
  } catch (e) {
    trackItwStatusWalletAttestationFailure();
    // There may be cases of users who left the wallet activation flow right after creating a Wallet Instance, without getting a PID.
    // If another user then logs in, the previous integrity key tag is still stored and sent to the Wallet Provider: when this happens
    // the WI status endpoint returns 404 and the wallet is reset to avoid any inconsistency.
    if (Errors.isWalletProviderResponseError(e) && e.statusCode === 404) {
      yield* call(handleWalletInstanceResetSaga);
      yield* put(itwUpdateWalletInstanceStatus.cancel());
      yield* call(trackItwWalletBadState);
    } else {
      yield* put(itwUpdateWalletInstanceStatus.failure(getNetworkError(e)));
    }
  }
}
