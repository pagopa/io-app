import { testSaga } from "redux-saga-test-plan";
import { getCdcStatusWallet } from "../../../bonus/cdc/wallet/store/actions";
import { cgnDetails } from "../../../bonus/cgn/store/actions/details";
import { isCgnDetailsAlreadyFetchedSelector } from "../../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../../payments/wallet/store/actions";
import { walletUpdate } from "../../store/actions";
import { handleWalletUpdateSaga } from "../handleWalletUpdateSaga";

describe("handleWalletUpdateSaga", () => {
  it("should fetch cgn details when isRefresh is true and cgn is already fetched", () => {
    testSaga(handleWalletUpdateSaga, walletUpdate({ isRefresh: true }))
      .next()
      .put(getPaymentsWalletUserMethods.request())
      .next()
      .put(idPayWalletGet.request())
      .next()
      .select(isCgnDetailsAlreadyFetchedSelector)
      .next(true)
      .put(cgnDetails.request())
      .next()
      .put(getCdcStatusWallet.request())
      .next()
      .isDone();
  });

  it("should fetch cgn details when isRefresh is false and cgn is not already fetched", () => {
    testSaga(handleWalletUpdateSaga, walletUpdate({ isRefresh: false }))
      .next()
      .put(getPaymentsWalletUserMethods.request())
      .next()
      .put(idPayWalletGet.request())
      .next()
      .select(isCgnDetailsAlreadyFetchedSelector)
      .next(false)
      .put(cgnDetails.request())
      .next()
      .put(getCdcStatusWallet.request())
      .next()
      .isDone();
  });

  it("should skip cgn details when isRefresh is false and cgn is already fetched", () => {
    testSaga(handleWalletUpdateSaga, walletUpdate({ isRefresh: false }))
      .next()
      .put(getPaymentsWalletUserMethods.request())
      .next()
      .put(idPayWalletGet.request())
      .next()
      .select(isCgnDetailsAlreadyFetchedSelector)
      .next(true)
      .put(getCdcStatusWallet.request())
      .next()
      .isDone();
  });
});
