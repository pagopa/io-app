import "@testing-library/jest-native/extend-expect";
import { render, RenderAPI } from "@testing-library/react-native";
import * as pot from "italia-ts-commons/lib/pot";
import MockDate from "mockdate";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../../../../../utils/accessibility";
import { BpdAmount } from "../../../../../saga/networking/amount";
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
import { readyRanking } from "../../../../../store/reducers/__mock__/ranking";
import { BpdPeriodWithInfo } from "../../../../../store/reducers/details/periods";
import BpdSummaryComponent from "../BpdSummaryComponent";

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: jest.fn()
  })
}));

describe("Bpd Summary Component graphical test for different states", () => {
  const mockStore = configureMockStore();
  MockDate.set("2020-11-04");

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

    // When the period is "Active" and transactionNumber<minTransactionNumber,
    // TextualSummary should be null if totalCashback == 0
    expect(component.queryByTestId("currentPeriodWarning")).toBeNull();
  });

  it("Render Active period, transactionNumber < minTransactionNumber, totalCashback > 0", () => {
    const store = mockStore(
      mockBpdState({
        ...activePeriod,
        amount: notEligibleAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    activePeriodNotEnoughTransaction(component, notEligibleAmount);

    // When the period is "Active" and transactionNumber<minTransactionNumber,
    // TextualSummary should be null if totalCashback > 0
    const textualSummary = component.queryByTestId("currentPeriodWarning");
    expect(textualSummary).toBeEnabled();
    // The text description should indicate the minimum transaction required to acquire the cashback
    expect(textualSummary).toHaveTextContent(
      activePeriod.minTransactionNumber.toString()
    );
  });

  it("Render Active period, transactionNumber >= minTransactionNumber", () => {
    const store = mockStore(
      mockBpdState({
        ...activePeriod,
        amount: eligibleAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    // When the period is "Active" and transactionNumber >= minTransactionNumber,
    // the TransactionsGraphicalSummary should be null
    expect(component.queryByTestId("progressBar")).toBeNull();
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
  });

  it("Render Closed period, grace period", () => {
    MockDate.set("2020-11-04");
    const store = mockStore(
      mockBpdState({
        ...closedPeriod,
        amount: zeroAmount,
        ranking: readyRanking
      })
    );
    const componentGrace = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

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
    const store = mockStore(
      mockBpdState({
        ...closedPeriod,
        amount: zeroAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );
    expect(component.queryByTestId("closedPeriodKO")).toBeEnabled();
  });

  it("Render Closed period, cashback earned", () => {
    MockDate.set("2020-11-09");
    const store = mockStore(
      mockBpdState({
        ...closedPeriod,
        amount: eligibleAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );
    const textualSummary = component.queryByTestId("closedPeriodOK");
    expect(textualSummary).toBeEnabled();
    expect(textualSummary).toHaveTextContent(
      eligibleAmount.totalCashback.toString()
    );
  });

  it("Render Closed period, max cashback earned", () => {
    MockDate.set("2020-11-09");
    const store = mockStore(
      mockBpdState({
        ...closedPeriod,
        amount: eligibleMaxAmount,
        ranking: readyRanking
      })
    );
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );
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
 * @param amount
 */
const mockBpdState = (period: BpdPeriodWithInfo) => ({
  bonus: {
    bpd: {
      details: {
        selectedPeriod: period
      }
    }
  },
  profile: pot.none
});

const activePeriodNotEnoughTransaction = (
  component: RenderAPI,
  amount: BpdAmount
) => {
  expect(component).not.toBeNull();

  // When the period is "Active" and transactionNumber<minTransactionNumber,
  // GraphicalSummary should be enabled
  expect(component.queryByTestId("progressBar")).toBeEnabled();
  expect(component.queryByTestId("percentageTransactions.title")).toBeEnabled();
  expect(
    component.queryByTestId("percentageTransactions.transactions")
  ).toHaveTextContent(amount.transactionNumber.toString());
};
