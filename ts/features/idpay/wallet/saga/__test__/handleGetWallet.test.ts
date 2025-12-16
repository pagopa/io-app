import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayWalletGet } from "../../store/actions";
import { handleGetIDPayWallet } from "../handleGetWallet";
import { walletAddCards } from "../../../../wallet/store/actions/cards";

const mockedWallet: WalletDTO = { initiativeList: [] };

describe("handleGetIDPayWallet", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      idPayWalletGet.success
    )} with the initiative beneficiary details`, () => {
      const getWallet = jest.fn();
      const mockedState = {
        features: {
          wallet: {
            cards: {}
          }
        }
      };
      testSaga(
        handleGetIDPayWallet,
        getWallet,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayWalletGet.request()
      )
        .next()
        .call(withRefreshApiCall, getWallet(), idPayWalletGet.request())
        .next(E.right({ status: 200, value: mockedWallet }))
        .put(walletAddCards([]))
        .next()
        .select()
        .next(mockedState)
        .put(idPayWalletGet.success(mockedWallet))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(idPayWalletGet.failure)} with the error`, () => {
      const getWallet = jest.fn();
      testSaga(
        handleGetIDPayWallet,
        getWallet,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayWalletGet.request()
      )
        .next()
        .call(withRefreshApiCall, getWallet(), idPayWalletGet.request())
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idPayWalletGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
