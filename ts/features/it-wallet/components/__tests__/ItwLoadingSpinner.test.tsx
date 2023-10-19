import React from "react";
import { render } from "@testing-library/react-native";
import ItwLoadingSpinner from "../ItwLoadingSpinner";

type Props = {
  color: string;
};

describe("Test ItwLoadingSpinner animated indicator", () => {
  it("should render a Loading Spinner Container correctly", () => {
    const props = {
      color: "#ABC"
    };
    const component = renderComponent({ ...props });
    expect(component.getByTestId("LoadingSpinnerTestID")).toBeTruthy();
  });
  it("should render a Loading Animation correctly with expected color", () => {
    const props = {
      color: "#ABC"
    };

    const component = renderComponent({ ...props });
    expect(component.getByTestId("LoadingSpinnerAnimatedTestID")).toBeTruthy();
    expect(component.queryByA11yRole("progressbar")).not.toBeNull();
    const { style } = component.getByTestId(
      "LoadingSpinnerAnimatedTestID"
    ).props;
    expect(style).toHaveProperty("borderTopColor", "#ABC");
  });
});

const renderComponent = ({ color }: Props) =>
  render(<ItwLoadingSpinner color={color} />);
