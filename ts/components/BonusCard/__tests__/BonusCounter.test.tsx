import { render } from "@testing-library/react-native";
import React from "react";
import { BonusCardCounter } from "../BonusCardCounter";

describe("Test BonusCardCounter", () => {
  describe("when type is Value", () => {
    describe("when the component is loading", () => {
      it("should display the skeleton", () => {
        const { queryByTestId } = renderComponent({
          isLoading: true,
          type: "Value"
        });
        expect(queryByTestId("BonusCardCounterSkeletonTestID")).not.toBeNull();
        expect(queryByTestId("BonusCardCounterTestID")).toBeNull();
      });
    });
    describe("when the component is not loading", () => {
      it("should display the content", () => {
        const T_LABEL = "Test label";
        const T_VALUE = "9.9999,99 €";

        const { queryByTestId, queryByText } = renderComponent({
          type: "Value",
          label: T_LABEL,
          value: T_VALUE
        });

        expect(queryByTestId("BonusCardCounterSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardCounterTestID")).not.toBeNull();
        expect(queryByTestId("BonusCardCounterProgressTestID")).toBeNull();
        expect(queryByText(T_LABEL)).not.toBeNull();
        expect(queryByText(T_VALUE)).not.toBeNull();
      });
    });
  });

  describe("when type is ValueWithProgress", () => {
    describe("when the component is loading", () => {
      it("should display the skeleton", () => {
        const { queryByTestId } = renderComponent({
          isLoading: true,
          type: "ValueWithProgress"
        });
        expect(queryByTestId("BonusCardCounterSkeletonTestID")).not.toBeNull();
        expect(queryByTestId("BonusCardCounterTestID")).toBeNull();
      });
    });
    describe("when the component is not loading", () => {
      it("should display the content", () => {
        const T_LABEL = "Test label";
        const T_VALUE = "9.9999,99 €";

        const { queryByTestId, queryByText } = renderComponent({
          type: "ValueWithProgress",
          label: T_LABEL,
          value: T_VALUE,
          progress: 0.2
        });

        expect(queryByTestId("BonusCardCounterSkeletonTestID")).toBeNull();
        expect(queryByTestId("BonusCardCounterTestID")).not.toBeNull();
        expect(queryByTestId("BonusCardCounterProgressTestID")).not.toBeNull();
        expect(queryByText(T_LABEL)).not.toBeNull();
        expect(queryByText(T_VALUE)).not.toBeNull();
      });
    });
  });
});

const renderComponent = (props: BonusCardCounter) =>
  render(<BonusCardCounter {...props} />);
