import { render } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import I18n from "../../../i18n";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { format } from "../../../utils/dates";
import { BonusCardStatus } from "../BonusCardStatus";

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

describe("Test BonusCardStatus", () => {
  describe("when the component is loading", () => {
    it("should display the skeleton", () => {
      const { queryByTestId } = renderComponent({
        isLoading: true
      });
      expect(queryByTestId("BonusCardStatusSkeletonTestID")).not.toBeNull();
      expect(queryByTestId("BonusCardStatusTestID")).toBeNull();
    });
  });
  describe("when the component is not loading", () => {
    describe("when the status is ACTIVE", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_VALIDITY_TEXT = I18n.t("bonusCard.validUntil", {
          endDate: format(T_END_DATE, "DD/MM/YY")
        });
        const { queryByTestId, queryByText } = renderComponent({
          status: "ACTIVE",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
      });
    });
    describe("when the status is PAUSED", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_PAUSED_TEXT = I18n.t("bonusCard.paused");
        const { queryByTestId, queryByText } = renderComponent({
          status: "PAUSED",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_PAUSED_TEXT)).not.toBeNull();
      });
    });
    describe("when the status is EXPIRING", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_VALIDITY_TEXT = I18n.t("bonusCard.expiring", {
          endDate: format(T_END_DATE, "DD/MM/YY")
        });
        const { queryByTestId, queryByText } = renderComponent({
          status: "EXPIRING",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
      });
    });
    describe("when the status is EXPIRED", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_VALIDITY_TEXT = I18n.t("bonusCard.expired", {
          endDate: format(T_END_DATE, "DD/MM/YY")
        });
        const { queryByTestId, queryByText } = renderComponent({
          status: "EXPIRED",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
      });
    });
    describe("when the status is REMOVED", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_REMOVED_TEXT = I18n.t("bonusCard.removed");
        const { queryByTestId, queryByText } = renderComponent({
          status: "REMOVED",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_REMOVED_TEXT)).not.toBeNull();
      });
    });
  });
});

const renderComponent = (props: BonusCardStatus) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store: Store<GlobalState> = createStore(appReducer, globalState as any);

  return render(
    <Provider store={store}>
      <BonusCardStatus {...props} />
    </Provider>
  );
};
