import React from "react";
import { render } from "@testing-library/react-native";
import ItwLoadingSpinner from "../ItwLoadingSpinner";

type Props = {
  color: string;
  captionTitle?: string;
  captionSubtitle?: string;
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
  it("should render a Loading Animation correctly with caption title and subtitle", () => {
    const props = {
      color: "#ABC",
      captionTitle: "Loading",
      captionSubtitle: "Please wait"
    };

    const component = renderComponent({ ...props });
    const captionTitle = component.getByTestId("LoadingSpinnerCaptionTitleID");
    const captionSubtitle = component.getByTestId(
      "LoadingSpinnerCaptionSubTitleID"
    );
    expect(captionTitle).toBeTruthy();
    expect(captionSubtitle).toBeTruthy();
    expect(captionTitle.props.children).toEqual("Loading");
    expect(captionSubtitle.props.children).toEqual("Please wait");
  });
});

const renderComponent = ({ color, captionTitle, captionSubtitle }: Props) =>
  render(
    <ItwLoadingSpinner
      color={color}
      captionTitle={captionTitle}
      captionSubtitle={captionSubtitle}
    />
  );
