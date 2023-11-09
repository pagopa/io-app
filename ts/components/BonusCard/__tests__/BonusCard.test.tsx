import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BonusCard } from "../BonusCard";
import { BonusCounter } from "../BonusCounter";

describe("Test BonusCard", () => {
  describe("when the component is loading", () => {
    it("should display the skeleton", () => {
      const component = renderComponent(<BonusCard isLoading={true} />);

      expect(component.queryByTestId("BonudCardSkeletonTestID")).toBeTruthy();
      expect(component.queryByTestId("BonudCardContentTestID")).toBeFalsy();
    });
  });
  describe("when the component is not loading", () => {
    it("should display the content", () => {
      const T_NAME = "Bonus name";
      const T_ORG_NAME = "Bonus name";
      const T_END_DATE = new Date(2023, 10, 10);

      const T_COUNTER_WITH_PROGRESS: BonusCounter = {
        type: "ValueWithProgress",
        progress: 0.4,
        label: "Test",
        value: "9.999,99 €"
      };
      const T_COUNTER: BonusCounter = {
        type: "Value",
        label: "Test",
        value: "9.999,99 €"
      };

      const component = renderComponent(
        <BonusCard
          name={T_NAME}
          organizationName={T_ORG_NAME}
          endDate={T_END_DATE}
          status="ACTIVE"
          counters={[T_COUNTER_WITH_PROGRESS, T_COUNTER]}
        />
      );

      expect(component.queryByTestId("BonudCardSkeletonTestID")).toBeFalsy();
      expect(component.queryByTestId("BonudCardContentTestID")).toBeTruthy();
    });
  });
});

const renderComponent = (component: React.ReactElement<any>) =>
  render(<SafeAreaProvider>{component}</SafeAreaProvider>);
