import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";

import { walletRemoveCardsByCategory } from "../../../../wallet/store/actions/cards";
import {
  itwCredentialsEidSelector,
  itwCredentialsSelector
} from "../../../credentials/store/selectors";
import { CredentialsVault } from "../../../credentials/utils/vault";
import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../../walletInstance/store/actions";
import * as lifecycleAnalytics from "../../analytics";
import { itwLifecycleStoresReset } from "../../store/actions";
import { handleWalletInstanceResetSaga } from "../handleWalletInstanceResetSaga";

describe("handleWalletInstanceResetSaga", () => {
  it("tracks a reset failure", () => {
    const error = new Error("vault error");
    const trackFailure = jest
      .spyOn(lifecycleAnalytics, "trackItwWalletInstanceResetFailure")
      .mockImplementation();

    testSaga(handleWalletInstanceResetSaga)
      .next()
      .select(itwIntegrityKeyTagSelector)
      .next(O.none)
      .select(itwCredentialsEidSelector)
      .next(O.none)
      .select(itwCredentialsSelector)
      .next({})
      .put(itwLifecycleStoresReset())
      .next()
      .put(walletRemoveCardsByCategory("itw"))
      .next()
      .put(itwSetWalletInstanceRemotelyActive(false))
      .next()
      .call(CredentialsVault.clear)
      .throw(error)
      .isDone();

    expect(trackFailure).toHaveBeenCalledWith(error);
  });
});
