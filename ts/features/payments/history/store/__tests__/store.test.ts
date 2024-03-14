import MockDate from "mockdate";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletPaymentInitState } from "../../../payment/store/actions/orchestration";
import { PaymentStartOrigin } from "../../../payment/types";
import {
  selectWalletOngoingPaymentHistory,
  selectWalletPaymentHistoryArchive
} from "../selectors";
import { walletPaymentHistoryStoreOutcome } from "../actions";
import { WalletPaymentOutcomeEnum } from "../../../payment/types/PaymentOutcomeEnum";

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
    expect(globalState.features.payments.history).toStrictEqual({
      archive: []
    });
    expect(selectWalletPaymentHistoryArchive(globalState)).toStrictEqual([]);
    expect(selectWalletOngoingPaymentHistory(globalState)).toBeUndefined();
  });

  it("should correctly update ongoing payment history", () => {
    const T_START_ORIGIN: PaymentStartOrigin = "manual_insertion";

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletPaymentInitState({
        startOrigin: T_START_ORIGIN
      })
    );

    expect(
      store.getState().features.payments.history.ongoingPayment
    ).toStrictEqual({
      startOrigin: T_START_ORIGIN,
      lookupId: MOCKED_LOOKUP_ID,
      startedAt: MOCKED_DATE
    });
    expect(store.getState().features.payments.history.archive).toStrictEqual(
      []
    );
  });

  it("should correctly update payment outcome on SUCCESS", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletPaymentHistoryStoreOutcome(WalletPaymentOutcomeEnum.SUCCESS)
    );
    expect(
      store.getState().features.payments.history.ongoingPayment?.outcome
    ).toBe(WalletPaymentOutcomeEnum.SUCCESS);
    expect(
      store.getState().features.payments.history.ongoingPayment?.success
    ).toBe(true);
  });

  it("should correctly update payment outcome on failure", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      walletPaymentHistoryStoreOutcome(
        WalletPaymentOutcomeEnum.CANCELED_BY_USER
      )
    );
    expect(
      store.getState().features.payments.history.ongoingPayment?.outcome
    ).toBe(WalletPaymentOutcomeEnum.CANCELED_BY_USER);
    expect(
      store.getState().features.payments.history.ongoingPayment?.success
    ).toBeUndefined();
  });
});
