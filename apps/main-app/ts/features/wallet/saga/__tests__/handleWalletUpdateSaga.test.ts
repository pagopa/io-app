import { testSaga } from "redux-saga-test-plan";
import { getCdcStatusWallet } from "../../../bonus/cdc/wallet/store/actions";
import { cgnDetails } from "../../../bonus/cgn/store/actions/details";
import { isCgnDetailsAlreadyFetchedSelector } from "../../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../../payments/wallet/store/actions";
import { handleWalletUpdateSaga } from "../handleWalletUpdateSaga";

describe("handleWalletUpdateSaga", () => {
  it("should perform the correct calls to update the wallet content", () => {
    testSaga(handleWalletUpdateSaga)
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

  it("should not fetch CGN details if already fetched", () => {
    testSaga(handleWalletUpdateSaga)
      .next()
      .put(getPaymentsWalletUserMethods.request())
      .next()
      .put(idPayWalletGet.request())
      .next()
      .select(isCgnDetailsAlreadyFetchedSelector)
      .next(true) // Simulate CGN details already fetched
      .put(getCdcStatusWallet.request())
      .next()
      .isDone();
  });
});
