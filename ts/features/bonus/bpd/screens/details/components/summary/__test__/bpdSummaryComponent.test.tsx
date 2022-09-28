import * as pot from "@pagopa/ts-commons/lib/pot";
import "@testing-library/jest-native/extend-expect";
import { render, RenderAPI } from "@testing-library/react-native";
import MockDate from "mockdate";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../../../../i18n";
import {
  baseBackendConfig,
  baseBackendState,
  withBpdRankingConfig
} from "../../../../../../../../store/reducers/__mock__/backendStatus";
import { dateToAccessibilityReadableFormat } from "../../../../../../../../utils/accessibility";
import { formatIntegerNumber } from "../../../../../../../../utils/stringBuilder";
import {
  BpdPeriodWithInfo,
  isBpdRankingReady
} from "../../../../../store/reducers/details/periods";
import {
  eligibleAmount,
  eligibleMaxAmount,
  notEligibleAmount,
  zeroAmount
} from "../../../../../store/reducers/__mock__/amount";
import {
  activePeriod,
  closedPeriod,
  inactivePeriod
} from "../../../../../store/reducers/__mock__/periods";
import {
  notReadyRanking,
  readyRanking
} from "../../../../../store/reducers/__mock__/ranking";
import BpdSummaryComponent from "../BpdSummaryComponent";

describe("Bpd Summary Component graphical test for different states", () => {
  const mockStore = configureMockStore();
  MockDate.set("2020-11-04");
  jest.useFakeTimers();

  it("Render Inactive period", () => {
    const store = mockStore(
      mockBpdState({
        ...inactivePeriod,
        amount: zeroAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expect(component).not.toBeNull();

    // When the period is "Inactive", the TransactionsGraphicalSummary should be null
    expect(component.queryByTestId("progressBar")).toBeNull();

    // When the period is "Inactive", the SuperCashbackRankingSummary should be null
    expect(component.queryByTestId("supercashbackSummary.title")).toBeNull();

    expect(
      component.queryByTestId("textualTransaction.transactions")
    ).toBeNull();
    // When the period is "Inactive", the TextualSummary should be in "inactive" mode
    const textualSummary = component.queryByTestId("inactivePeriod");
    expect(textualSummary).toBeEnabled();
    // The TextualSummary text should include the start date of the inactive period
    expect(textualSummary).toHaveTextContent(
      dateToAccessibilityReadableFormat(inactivePeriod.startDate)
    );
  });

  it("Render Active period, transactionNumber<minTransactionNumber, totalCashback = 0", () => {
    const store = mockStore(
      mockBpdState({
        ...activePeriod,
        amount: zeroAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    // When the period is "Active" and totalCashback = 0 the SuperCashbackRankingSummary should be null
    expect(component.queryByTestId("supercashbackSummary.title")).toBeNull();

    // When the period is "Active" and transactionNumber<minTransactionNumber,
    // TextualSummary should be null if totalCashback == 0
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();
  });

  it("Render Active period, transactionNumber < minTransactionNumber, totalCashback > 0", () => {
    const period = {
      ...activePeriod,
      amount: notEligibleAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    // When the period is "Active" and transactionNumber<minTransactionNumber,
    // TextualSummary should be null if totalCashback > 0
    const textualSummary = component.queryByTestId("currentPeriodWarning");

    expectSuperCashback(component, period);

    expect(textualSummary).toBeEnabled();
    // The text description should indicate the minimum transaction required to acquire the cashback
    expect(textualSummary).toHaveTextContent(
      activePeriod.minTransactionNumber.toString()
    );
  });

  it("Render Active period, transactionNumber < minTransactionNumber, totalCashback > 0, supercashback not ready", () => {
    const period = {
      ...activePeriod,
      amount: notEligibleAmount,
      ranking: notReadyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    // When the period is "Active" and transactionNumber<minTransactionNumber,
    // TextualSummary should be null if totalCashback > 0
    const textualSummary = component.queryByTestId("currentPeriodWarning");

    expectSuperCashback(component, period);

    expect(textualSummary).toBeEnabled();
    // The text description should indicate the minimum transaction required to acquire the cashback
    expect(textualSummary).toHaveTextContent(
      activePeriod.minTransactionNumber.toString()
    );
  });

  it("Render Active period, transactionNumber >= minTransactionNumber, ranking <= minPosition, no max amount", () => {
    const period = {
      ...activePeriod,
      amount: eligibleAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    // TextualTransaction should be enabled
    const textualTransactionTransactions = component.queryByTestId(
      "textualTransaction.transactions"
    );
    expect(textualTransactionTransactions).toBeEnabled();

    expect(textualTransactionTransactions).toHaveTextContent(
      eligibleAmount.transactionNumber.toString()
    );

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();

    // When ranking <= minPosition
    expect(component.queryByTestId("currentPeriodSuperCashback")).toBeEnabled();
  });

  it("Render Active period, transactionNumber >= minTransactionNumber, ranking <= minPosition, max amount", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: {
        ...eligibleAmount,
        totalCashback: activePeriod.maxPeriodCashback
      },
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    // TextualTransaction should be enabled
    const textualTransactionTransactions = component.queryByTestId(
      "textualTransaction.transactions"
    );
    expect(textualTransactionTransactions).toBeEnabled();

    expect(textualTransactionTransactions).toHaveTextContent(
      eligibleAmount.transactionNumber.toString()
    );

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();

    // When ranking <= minPosition
    expect(component.queryByTestId("currentPeriodSuperCashback")).toBeEnabled();
  });

  it("Render Active period, transactionNumber >= minTransactionNumber, ranking > minPosition, no max amount", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: eligibleAmount,
      ranking: { ...readyRanking, ranking: 1000000 }
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    // TextualTransaction should be enabled
    const textualTransactionTransactions = component.queryByTestId(
      "textualTransaction.transactions"
    );
    expect(textualTransactionTransactions).toBeEnabled();

    expect(textualTransactionTransactions).toHaveTextContent(
      eligibleAmount.transactionNumber.toString()
    );

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();

    expect(component.queryByTestId("currentPeriodUnlock")).toBeEnabled();
  });

  it("Render Active period, transactionNumber > minTransactionNumber+10, ranking > minPosition, no max amount", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: {
        ...eligibleAmount,
        transactionNumber: activePeriod.minTransactionNumber + 11
      },
      ranking: { ...readyRanking, ranking: 1000000 }
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    // TextualTransaction should be enabled
    const textualTransactionTransactions = component.queryByTestId(
      "textualTransaction.transactions"
    );
    expect(textualTransactionTransactions).toBeEnabled();

    expect(textualTransactionTransactions).toHaveTextContent(
      period.amount.transactionNumber.toString()
    );

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();

    expect(component.queryByTestId("currentPeriodUnlock")).toBeNull();
  });

  it("Render Active period, transactionNumber >= minTransactionNumber, ranking > minPosition, max amount", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: {
        ...eligibleAmount,
        totalCashback: activePeriod.maxPeriodCashback
      },
      ranking: { ...readyRanking, ranking: 1000000 }
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    // TextualTransaction should be enabled
    const textualTransactionTransactions = component.queryByTestId(
      "textualTransaction.transactions"
    );
    expect(textualTransactionTransactions).toBeEnabled();

    expect(textualTransactionTransactions).toHaveTextContent(
      eligibleAmount.transactionNumber.toString()
    );

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();

    expect(component.queryByTestId("currentPeriodMaxAmount")).toBeEnabled();
  });

  it("Render Closed period, grace period", () => {
    MockDate.set("2020-11-04");
    const period = {
      ...closedPeriod,
      amount: zeroAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const componentGrace = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(componentGrace, period);

    // When the period is "Active" and transactionNumber>=minTransactionNumber,
    // no TextualSummary should be rendered.
    const textualSummary = componentGrace.queryByTestId("gracePeriod");
    expect(textualSummary).toBeEnabled();
    expect(textualSummary).toHaveTextContent(
      dateToAccessibilityReadableFormat(closedPeriod.endDate)
    );
    MockDate.reset();

    // Grace period ends
    MockDate.set("2020-11-06");
    const componentNoGrace = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );
    expect(componentNoGrace.queryByTestId("gracePeriod")).toBeNull();
  });

  it("Render Closed period, not enough transactions", () => {
    MockDate.set("2020-11-09");
    const period = {
      ...closedPeriod,
      amount: zeroAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );
    expect(component.queryByTestId("closedPeriodKO")).toBeEnabled();

    expectSuperCashback(component, period);
  });

  it("Render Closed period, cashback earned", () => {
    MockDate.set("2020-11-09");
    const period = {
      ...closedPeriod,
      amount: eligibleAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    const textualSummary = component.queryByTestId("closedPeriodOK");
    expect(textualSummary).toBeEnabled();
    expect(textualSummary).toHaveTextContent(
      eligibleAmount.totalCashback.toString()
    );
  });

  it("Render Closed period, max cashback earned", () => {
    MockDate.set("2020-11-09");
    const period = {
      ...closedPeriod,
      amount: eligibleMaxAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, true));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashback(component, period);

    const textualSummary = component.queryByTestId("closedPeriodOK");
    expect(textualSummary).toBeEnabled();
    expect(textualSummary).toHaveTextContent(
      eligibleMaxAmount.totalCashback.toString()
    );
    const maxAmount = I18n.t(
      "bonus.bpd.details.components.transactionsCountOverview.closedPeriodMaxAmount"
    );
    expect(textualSummary).toHaveTextContent(maxAmount);
  });

  MockDate.reset();
});

/**
 * Generate a mocked state with the fields required for these tests
 * @param period
 * @param bpdRankingRemoteConfig
 */
export const mockBpdState = (
  period: BpdPeriodWithInfo,
  bpdRankingRemoteConfig?: boolean
) => ({
  bonus: {
    bpd: {
      details: {
        selectedPeriod: period
      }
    }
  },
  backendStatus:
    bpdRankingRemoteConfig === undefined
      ? baseBackendState
      : withBpdRankingConfig(baseBackendState, {
          ...baseBackendConfig,
          bpd_ranking_v2: bpdRankingRemoteConfig
        }),
  profile: pot.none
});

/**
 * Test the graphical states for SuperCashbackRankingSummary
 * @param component
 * @param period
 */
const expectSuperCashback = (
  component: RenderAPI,
  period: BpdPeriodWithInfo
) => {
  if (isBpdRankingReady(period.ranking)) {
    expectSuperCashbackReady(component, period);
  } else {
    expectSuperCashbackNotReady(component);
  }
};

export const expectSuperCashbackReady = (
  component: RenderAPI,
  period: BpdPeriodWithInfo
) => {
  if (isBpdRankingReady(period.ranking)) {
    // The SuperCashbackRankingSummary should be visible
    expect(component.queryByTestId("supercashbackSummary.title")).toBeEnabled();
    expect(
      component.queryByTestId("supercashbackSummary.ranking")
    ).toHaveTextContent(formatIntegerNumber(period.ranking.ranking));
    expect(
      component.queryByTestId("supercashbackSummary.minRanking")
    ).toHaveTextContent(formatIntegerNumber(period.minPosition));
  } else {
    fail("Expected BpdRankingReady");
  }
};

export const expectSuperCashbackNotReady = (component: RenderAPI) => {
  expect(component.queryByTestId("supercashbackSummary.title")).toBeNull();
  expect(
    component.queryByTestId("superCashbackRankingNotReady.title")
  ).toBeEnabled();
};
