import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { NewSessionTokenResponse } from "../../../../../../../definitions/pagopa/ecommerce/NewSessionTokenResponse";
import { getGenericError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";
import { walletPaymentNewSessionToken } from "../../../store/actions/networking";
import { handleWalletPaymentNewSessionToken } from "../handleWalletPaymentNewSessionToken";

describe("Test handleWalletPaymentNewSessionToken saga", () => {
  it(`should put ${getType(
    walletPaymentNewSessionToken.success
  )} when newSessionToken is 200`, () => {
    const T_SESSION_TOKEN = "ABCD";
    const mocknewSessionToken = jest.fn();
    const newSessionTokenResponse: NewSessionTokenResponse = {
      sessionToken: T_SESSION_TOKEN
    };

    testSaga(
      handleWalletPaymentNewSessionToken,
      mocknewSessionToken,
      walletPaymentNewSessionToken.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mocknewSessionToken(),
        walletPaymentNewSessionToken.request()
      )
      .next(E.right({ status: 200, value: newSessionTokenResponse }))
      .put(walletPaymentNewSessionToken.success(newSessionTokenResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentNewSessionToken.failure
  )} when newSessionToken is not 200`, () => {
    const mocknewSessionToken = jest.fn();

    testSaga(
      handleWalletPaymentNewSessionToken,
      mocknewSessionToken,
      walletPaymentNewSessionToken.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mocknewSessionToken(),
        walletPaymentNewSessionToken.request()
      )
      .next(E.right({ status: 400, value: undefined }))
      .put(
        walletPaymentNewSessionToken.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    walletPaymentNewSessionToken.failure
  )} when newSessionToken encoders returns an error`, () => {
    const mocknewSessionToken = jest.fn();

    testSaga(
      handleWalletPaymentNewSessionToken,
      mocknewSessionToken,
      walletPaymentNewSessionToken.request()
    )
      .next()
      .call(
        withRefreshApiCall,
        mocknewSessionToken(),
        walletPaymentNewSessionToken.request()
      )
      .next(E.left([]))
      .put(
        walletPaymentNewSessionToken.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
