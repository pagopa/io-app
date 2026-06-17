import { testSaga } from "redux-saga-test-plan";
import { handleGetWhitelistedStatus } from "../handleGetWhitelistedStatus";
import { itwSetFiscalCodeWhitelisted } from "../../../common/store/actions/preferences";
import { ItWalletClient } from "../../../api/client";

const mockItWalletClient: Partial<ItWalletClient> = {
  isFiscalCodeWhitelisted: jest.fn()
};

type MockResponse = Awaited<
  ReturnType<ItWalletClient["isFiscalCodeWhitelisted"]>
>;

describe("handleGetWhitelistedStatus Saga", () => {
  it("should dispatch itwSetFiscalCodeWhitelisted(true) on success response with whitelisted true", () => {
    const sessionToken = "mock-session-token";
    const response: MockResponse = {
      _tag: "Right",
      right: {
        status: 200,
        value: { whitelisted: true, fiscalCode: "mock-fiscal-code" },
        headers: {}
      }
    };

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
    const response: MockResponse = {
      _tag: "Right",
      right: {
        status: 200,
        value: { whitelisted: false, fiscalCode: "mock-fiscal-code" },
        headers: {}
      }
    };

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

  it("should not dispatch anything on non-200 response", () => {
    const sessionToken = "mock-session-token";
    const response: MockResponse = {
      _tag: "Right",
      right: {
        status: 500,
        value: {},
        headers: {}
      }
    };

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
      .isDone();
  });

  it("should not dispatch anything on network error", () => {
    const sessionToken = "mock-session-token";

    testSaga(
      handleGetWhitelistedStatus,
      mockItWalletClient as ItWalletClient,
      sessionToken
    )
      .next()
      .call(mockItWalletClient.isFiscalCodeWhitelisted!, {
        Bearer: sessionToken
      })
      .throw(new Error("Network error"))
      .isDone();
  });
});
