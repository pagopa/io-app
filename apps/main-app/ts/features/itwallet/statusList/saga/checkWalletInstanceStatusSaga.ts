import { call, select } from "typed-redux-saga/macro";

import { getIoWallet } from "../../common/utils/itwIoWallet";
import { itwWalletInstanceStatusListSelector } from "../../walletInstance/store/selectors";
import { StatusListRepository } from "../utils/repository";
import { StatusListContext } from "../utils/types";

/**
 * Updates the validity of credentials whose status list is available in the cache.
 */
export function* checkWalletInstanceStatusSaga({
  itwVersion
}: StatusListContext) {
  const ioWallet = getIoWallet(itwVersion);
  if (!ioWallet.CredentialStatus.statusList.isSupported) {
    return;
  }

  const walletInstanceStatusList = yield* select(
    itwWalletInstanceStatusListSelector
  );
  if (walletInstanceStatusList === undefined) {
    // TODO what if wallet instance status list is missing?
    return;
  }

  const { idx, uri } = walletInstanceStatusList;
  const statusList = yield* call(StatusListRepository.get, uri);
  if (statusList === undefined) {
    // TODO what if status list entry is missing?
    return;
  }

  const { status } = ioWallet.CredentialStatus.statusList.getStatus(
    statusList.status_list,
    idx
  );

  // Every status check in the app is done against the lowercase value, so it is transformed here.
  // TODO: [SIW-4664] Export a more accurate type from `getStatus`.
  const canonicalStatus = status.toLowerCase();
  if (canonicalStatus !== "valid") {
    // TODO WI is not valid
  }
}
