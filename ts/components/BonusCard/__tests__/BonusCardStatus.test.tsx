import { render } from "@testing-library/react-native";
import React from "react";
import { BonusCardStatus } from "../BonusCardStatus";
import I18n from "../../../i18n";
import { format } from "../../../utils/dates";

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
        const T_VALIDITY_TEXT = I18n.t("bonusCard.validUntil", {
          endDate: format(T_END_DATE, "DD/MM/YY")
        });
        const T_PAUSED_TEXT = I18n.t("bonusCard.paused");
        const { queryByTestId, queryByText } = renderComponent({
          status: "PAUSED",
          endDate: T_END_DATE
        });
        expect(queryByTestId("BonusCardStatusSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardStatusTestID")).not.toBeNull();
        expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
        expect(queryByText(T_PAUSED_TEXT)).not.toBeNull();
      });
    });
    describe("when the status is EXPIRING", () => {
      it("should display the correct content", () => {
        const T_END_DATE = new Date(2025, 10, 12);
        const T_VALIDITY_TEXT = I18n.t("bonusCard.expiring", {
          endDate: format(T_END_DATE, "DD MMMM YYYY")
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

const renderComponent = (props: BonusCardStatus) =>
  render(<BonusCardStatus {...props} />);
