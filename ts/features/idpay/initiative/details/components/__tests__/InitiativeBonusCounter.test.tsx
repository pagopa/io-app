import { render } from "@testing-library/react-native";
import * as React from "react";
import {
  BonusCounter,
  InitiativeBonusCounter
} from "../InitiativeBonusCounter";

describe("Test InitiativeBonusCounter component", () => {
  it("should render a InitiativeBonusCounter component with props correctly", () => {
    const props: BonusCounter = {
      type: "Amount",
      label: "Test",
      amount: 100
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should render a InitiativeBonusCounter component with correct label and amount", () => {
    const props: BonusCounter = {
      type: "Amount",
      label: "Test label",
      amount: 1297.32
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("Test label")).toBeTruthy();
    expect(component.queryByText(/1,297.32 €/)).toBeTruthy();
  });

  it("should render a InitiativeBonusCounter component without progressbar", () => {
    const props: BonusCounter = {
      type: "Amount",
      label: "Test label",
      amount: 1297.32
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByTestId("BonusProgressBarTestID")).not.toBeTruthy();
  });

  it("should render a InitiativeBonusCounter component with progress bar", () => {
    const props: BonusCounter = {
      type: "AmountWithProgress",
      label: "Test label",
      amount: 1297.32,
      progress: 50
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByTestId("BonusProgressBarTestID")).toBeTruthy();
  });

  it("should render a InitiativeBonusCounter skeleton", () => {
    const props: BonusCounter = {
      type: "AmountWithProgress",
      isLoading: true
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("AmountWithProgressSkeletonTestID")
    ).toBeTruthy();
  });
});

const renderComponent = (props: BonusCounter) =>
  render(<InitiativeBonusCounter {...props} />);
