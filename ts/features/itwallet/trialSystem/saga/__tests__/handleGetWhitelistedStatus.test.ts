import { testSaga } from "redux-saga-test-plan";
import * as E from "fp-ts/Either";
import { handleGetWhitelistedStatus } from "../handleGetWhitelistedStatus";
import { itwSetFiscalCodeWhitelisted } from "../../../common/store/actions/preferences";
import { mockItWalletClient } from "../../../api/__mocks__/client.ts";
import { ItWalletClient } from "../../../api/client.ts";

describe("handleGetWhitelistedStatus Saga", () => {
  it("should dispatch itwSetFiscalCodeWhitelisted(true) on success response with whitelisted true", () => {
    const sessionToken = "mock-session-token";
    const response = E.right({
      status: 200,
      value: { whitelisted: true }
    });

    testSaga(
      handleGetWhitelistedStatus,
      mockItWalletClient as ItWalletClient,
      sessionToken
    )
      .next()
      .call(mockItWalletClient.isFiscalCodeWhitelisted!, {
        Bearer: sessionToken
      })
      .next(response)
      .put(itwSetFiscalCodeWhitelisted(true))
      .next()
      .isDone();
  });

  it("should dispatch itwSetFiscalCodeWhitelisted(false) on success response with whitelisted false", () => {
    const sessionToken = "mock-session-token";
    const response = E.right({
      status: 200,
      value: { whitelisted: false }
    });

    testSaga(
      handleGetWhitelistedStatus,
      mockItWalletClient as ItWalletClient,
      sessionToken
    )
      .next()
      .call(mockItWalletClient.isFiscalCodeWhitelisted!, {
        Bearer: sessionToken
      })
      .next(response)
      .put(itwSetFiscalCodeWhitelisted(false))
      .next()
      .isDone();
  });

  it("should dispatch itwSetFiscalCodeWhitelisted(false) on error", () => {
    const sessionToken = "mock-session-token";
    const error = new Error("Something went wrong");

    testSaga(
      handleGetWhitelistedStatus,
      mockItWalletClient as ItWalletClient,
      sessionToken
    )
      .next()
      .call(mockItWalletClient.isFiscalCodeWhitelisted!, {
        Bearer: sessionToken
      })
      .next(error)
      .put(itwSetFiscalCodeWhitelisted(false))
      .next()
      .isDone();
  });
});
