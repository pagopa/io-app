import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { CdcClient } from "../../common/api/client";
import { getCdcStatusWallet } from "../store/actions";
import { handleGetCdcStatusWallet } from "./handleGetCdcStatusWallet";

export function* watchCdcWalletSaga(cdcClient: CdcClient): SagaIterator {
  yield* takeLatest(
    getCdcStatusWallet.request,
    handleGetCdcStatusWallet,
    cdcClient.getStatus
  );
}
