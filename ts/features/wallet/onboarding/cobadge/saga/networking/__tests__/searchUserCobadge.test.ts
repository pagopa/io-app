import { right } from "fp-ts/lib/Either";
import { some } from "fp-ts/lib/Option";
import { createStore } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { CobadgeResponse } from "../../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { RestCobadgeResponse } from "../../../../../../../../definitions/pagopa/walletv2/RestCobadgeResponse";
import { ExecutionStatusEnum } from "../../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { PaymentManagerToken } from "../../../../../../../types/pagopa";
import { SessionManager } from "../../../../../../../utils/SessionManager";
import { searchUserCoBadge } from "../../../store/actions";
import { handleSearchUserCoBadge } from "../index";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("react-native-background-timer", () => ({}));

const baseCobadgeResponseOk: CobadgeResponse = {
  status: "OK",
  errors: [],
  payload: {
    searchRequestId: "searchRequestId",
    searchRequestMetadata: [
      {
        retrievedInstrumentsCount: 0,
        executionStatus: ExecutionStatusEnum.OK,
        serviceProviderName: "serviceProvider"
      }
    ],
    paymentInstruments: []
  }
};

const baseCobadgeResponsePending: CobadgeResponse = {
  status: "OK",
  errors: [],
  payload: {
    searchRequestId: "searchRequestId",
    searchRequestMetadata: [
      {
        retrievedInstrumentsCount: 0,
        executionStatus: ExecutionStatusEnum.PENDING,
        serviceProviderName: "serviceProvider"
      }
    ],
    paymentInstruments: []
  }
};

const mockRestCobadgeResponse = (
  res: CobadgeResponse
): RestCobadgeResponse => ({
  data: res
});

describe("searchUserCobadge", () => {
  const searchCobadgePans = jest.fn();
  const getCobadgePans = jest.fn();
  const response200SuccessOk = right({
    status: 200,
    value: mockRestCobadgeResponse(baseCobadgeResponseOk)
  });
  getCobadgePans.mockReturnValue(() => response200SuccessOk);
  searchCobadgePans.mockReturnValue(() => response200SuccessOk);
  const aPMToken = "1234" as PaymentManagerToken;
  const aPmSessionManager: SessionManager<PaymentManagerToken> =
    new SessionManager(jest.fn(() => Promise.resolve(some(aPMToken))));
  beforeEach(() => {
    getCobadgePans.mockClear();
    searchCobadgePans.mockClear();
  });

  it("With 200 RestCobadgeResponse OK, dispatch searchUserCoBadge.success", () =>
    expectSaga(
      handleSearchUserCoBadge,
      getCobadgePans,
      searchCobadgePans,
      aPmSessionManager,
      searchUserCoBadge.request("abi")
    )
      .withReducer(appReducer)
      .put(searchUserCoBadge.success(baseCobadgeResponseOk))
      .run()
      .then(rr => {
        const globalState = rr.storeState as GlobalState;
        // Without pending, no searchCoBadgeRequestId is expected
        expect(
          globalState.wallet.onboarding.coBadge.searchCoBadgeRequestId
        ).toBeNull();
        // without searchCoBadgeRequestId in the initial state, only 1 call to getCobadgePans is expected
        expect(getCobadgePans.mock.calls.length).toBe(1);
        expect(searchCobadgePans.mock.calls.length).toBe(0);
      }));
  it("With 200 RestCobadgeResponse OK, starting from a pending state, dispatch searchUserCoBadge.success", () => {
    // Simulate a previous call with pending state
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(searchUserCoBadge.success(baseCobadgeResponsePending));
    expect(
      store.getState().wallet.onboarding.coBadge.searchCoBadgeRequestId
    ).toBe("searchRequestId");

    // execute a new call
    return expectSaga(
      handleSearchUserCoBadge,
      getCobadgePans,
      searchCobadgePans,
      aPmSessionManager,
      searchUserCoBadge.request("abi")
    )
      .withReducer(appReducer, store.getState())
      .put(searchUserCoBadge.success(baseCobadgeResponseOk))
      .run()
      .then(rr => {
        const globalState = rr.storeState as GlobalState;
        // Without pending in the response, no searchCoBadgeRequestId is expected
        expect(
          globalState.wallet.onboarding.coBadge.searchCoBadgeRequestId
        ).toBeNull();
        // with searchCoBadgeRequestId in the initial state, only 1 call to searchCobadgePans is expected
        expect(getCobadgePans.mock.calls.length).toBe(0);
        expect(searchCobadgePans.mock.calls.length).toBe(1);
      });
  });
});
