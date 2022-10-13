import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";

import { Action, createStore } from "redux";
import ROUTES from "../../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../../utils/tests";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import { bpdAllData } from "../../../../store/actions/details";
import { AwardPeriodId } from "../../../../store/actions/periods";
import {
  BpdTransactions,
  bpdTransactionsLoad
} from "../../../../store/actions/transactions";
import * as transactionsReducer from "../../../../store/reducers/details/combiner";
import * as lastUpdateReducer from "../../../../store/reducers/details/lastUpdate";
import { BpdPeriodWithInfo } from "../../../../store/reducers/details/periods";
import BpdTransactionsScreen from "../BpdTransactionsScreen";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));
describe("BpdTransactionsScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  it("should show the TransactionUnavailable screen if bpdLastUpdate is pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, globalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("TransactionUnavailable")).toBeTruthy();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.noneLoading", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [bpdAllData.request()];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.noneUpdating", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        bpd: {
          ...globalState.bonus.bpd,
          details: {
            ...globalState.bonus.bpd.details,
            lastUpdate: pot.noneUpdating({} as Date)
          }
        }
      }
    };
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the TransactionUnavailable screen if bpdLastUpdate is pot.noneError", () => {
    const myspy = jest
      .spyOn(lastUpdateReducer, "bpdLastUpdateSelector")
      .mockReturnValue(pot.noneError({} as Error));

    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.failure({ message: "error" } as Error)
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("TransactionUnavailable")).toBeTruthy();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();

    myspy.mockRestore();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.someLoading", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.success(),
      bpdAllData.request()
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the TransactionUnavailable screen if bpdLastUpdate is pot.someError", () => {
    const myspy = jest
      .spyOn(lastUpdateReducer, "bpdLastUpdateSelector")
      .mockReturnValue(pot.someError({} as Date, {} as Error));

    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.success(),
      bpdAllData.request()
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("TransactionUnavailable")).toBeTruthy();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
    myspy.mockRestore();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.someUpdating", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        bpd: {
          ...globalState.bonus.bpd,
          details: {
            ...globalState.bonus.bpd.details,
            lastUpdate: pot.someUpdating({} as Date, {} as Date)
          }
        }
      }
    };
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the BpdAvailableTransactionsScreen if bpdLastUpdate is pot.some and transactionForSelectedPeriod is pot.none", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.success()
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.some and transactionForSelectedPeriod is pot.noneUpdating", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        bpd: {
          ...globalState.bonus.bpd,
          details: {
            ...globalState.bonus.bpd.details,
            lastUpdate: pot.some({} as Date),
            selectedPeriod: {
              awardPeriodId: 1 as AwardPeriodId
            } as BpdPeriodWithInfo,
            transactions: {
              1: pot.noneUpdating([])
            }
          }
        }
      }
    };
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the TransactionUnavailable screen if bpdLastUpdate is pot.some and transactionForSelectedPeriod is pot.noneError", () => {
    const lastUpdateSpy = jest
      .spyOn(lastUpdateReducer, "bpdLastUpdateSelector")
      .mockReturnValue(pot.some({} as Date));
    const transactionsSpy = jest
      .spyOn(transactionsReducer, "bpdDisplayTransactionsSelector")
      .mockReturnValue(pot.noneError({} as Error));

    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.success(),
      bpdTransactionsLoad.request(1 as AwardPeriodId),
      bpdTransactionsLoad.failure({
        awardPeriodId: 1 as AwardPeriodId,
        error: {} as Error
      })
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("TransactionUnavailable")).toBeTruthy();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
    lastUpdateSpy.mockRestore();
    transactionsSpy.mockRestore();
  });
  it("should show the LoadTransactions screen if bpdLastUpdate is pot.some and transactionForSelectedPeriod is pot.someUpdating", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        bpd: {
          ...globalState.bonus.bpd,
          details: {
            ...globalState.bonus.bpd.details,
            lastUpdate: pot.some({} as Date),
            selectedPeriod: {
              awardPeriodId: 1 as AwardPeriodId
            } as BpdPeriodWithInfo,
            transactions: {
              1: pot.someUpdating([], [])
            }
          }
        }
      }
    };
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    expect(component).toBeDefined();
    expect(component.queryByTestId("LoadTransactions")).toBeTruthy();
    expect(component.queryByTestId("TransactionUnavailable")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
  });
  it("should show the TransactionUnavailable screen if bpdLastUpdate is pot.some and transactionForSelectedPeriod is pot.someError", () => {
    const lastUpdateSpy = jest
      .spyOn(lastUpdateReducer, "bpdLastUpdateSelector")
      .mockReturnValue(pot.some({} as Date));
    const transactionsSpy = jest
      .spyOn(transactionsReducer, "bpdDisplayTransactionsSelector")
      .mockReturnValue(pot.someError([], {} as Error));

    const sequenceOfActions: ReadonlyArray<Action> = [
      bpdAllData.request(),
      bpdAllData.success(),
      bpdTransactionsLoad.request(1 as AwardPeriodId),
      bpdTransactionsLoad.success({} as BpdTransactions),
      bpdTransactionsLoad.request(1 as AwardPeriodId),
      bpdTransactionsLoad.failure({
        awardPeriodId: 1 as AwardPeriodId,
        error: {} as Error
      })
    ];

    const finalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const component = renderScreenFakeNavRedux<GlobalState>(
      () => <BpdTransactionsScreen />,
      ROUTES.WALLET_BPAY_DETAIL,
      {},
      createStore(appReducer, finalState as any)
    );

    // expect(finalState.bonus.bpd.details.transactions).toBe("");
    expect(component).toBeDefined();
    expect(component.queryByTestId("TransactionUnavailable")).toBeTruthy();
    expect(component.queryByTestId("LoadTransactions")).toBeNull();
    expect(
      component.queryByTestId("BpdAvailableTransactionsScreen")
    ).toBeNull();
    transactionsSpy.mockRestore();
    lastUpdateSpy.mockRestore();
  });
});
