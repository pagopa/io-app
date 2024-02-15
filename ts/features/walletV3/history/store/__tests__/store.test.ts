import MockDate from "mockdate";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletPaymentInitState } from "../../../payment/store/actions/orchestration";
import { PaymentStartOrigin } from "../../../payment/types";
import {
  selectWalletActivePaymentHistory,
  selectWalletPaymentsHistory
} from "../selectors";

const MOCKED_LOOKUP_ID = "123456";
const MOCKED_DATE = new Date();

jest.mock("../../../../../utils/pmLookUpId", () => ({
  getLookUpId: () => MOCKED_LOOKUP_ID
}));

describe("Test Wallet payment history reducers and selectors", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    MockDate.set(MOCKED_DATE);
  });

  it("should have INITIAL_STATE before any dispatched action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.history).toStrictEqual({
      history: []
    });
    expect(selectWalletPaymentsHistory(globalState)).toStrictEqual([]);
    expect(selectWalletActivePaymentHistory(globalState)).toBeUndefined();
  });

  it("should update active payment history", () => {
    const T_START_ORIGIN: PaymentStartOrigin = "manual_insertion";

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletPaymentInitState({
        startOrigin: T_START_ORIGIN
      })
    );

    expect(
      store.getState().features.wallet.history.activePaymentHistory
    ).toStrictEqual({
      startOrigin: T_START_ORIGIN,
      lookupId: MOCKED_LOOKUP_ID,
      startedAt: MOCKED_DATE
    });
    expect(store.getState().features.wallet.history.history).toStrictEqual([]);
  });
});
