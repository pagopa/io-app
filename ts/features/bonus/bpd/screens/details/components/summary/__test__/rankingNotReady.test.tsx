import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { notEligibleAmount } from "../../../../../store/reducers/__mock__/amount";
import { activePeriod } from "../../../../../store/reducers/__mock__/periods";
import {
  notReadyRanking,
  readyRanking
} from "../../../../../store/reducers/__mock__/ranking";
import { BpdPeriodWithInfo } from "../../../../../store/reducers/details/periods";
import BpdSummaryComponent from "../BpdSummaryComponent";
import {
  expectSuperCashbackNotReady,
  expectSuperCashbackReady,
  mockBpdState
} from "./bpdSummaryComponent.test";

describe("Ranking ready vs not ready", () => {
  const mockStore = configureMockStore();

  it("with ranking: ready, remote ranking: false should display SuperCashbackRankingNotReady", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: notEligibleAmount,
      ranking: readyRanking
    };
    const store = mockStore(mockBpdState(period, false));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashbackNotReady(component);
  });

  it("with ranking: ready, remote ranking: true should display SuperCashbackRankingReady", () => {
    const period: BpdPeriodWithInfo = {
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

    expectSuperCashbackReady(component, period);
  });

  it("with ranking: notReady, remote ranking: true should display SuperCashbackRankingNotReady", () => {
    const period: BpdPeriodWithInfo = {
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

    expectSuperCashbackNotReady(component);
  });

  it("with ranking: notReady, remote ranking: false should display SuperCashbackRankingNotReady", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: notEligibleAmount,
      ranking: notReadyRanking
    };
    const store = mockStore(mockBpdState(period, false));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashbackNotReady(component);
  });

  it("with ranking: notReady, remote ranking: undefined should display SuperCashbackRankingNotReady", () => {
    const period: BpdPeriodWithInfo = {
      ...activePeriod,
      amount: notEligibleAmount,
      ranking: notReadyRanking
    };
    const store = mockStore(mockBpdState(period));
    const component = render(
      <Provider store={store}>
        <BpdSummaryComponent />
      </Provider>
    );

    expectSuperCashbackNotReady(component);
  });
});
