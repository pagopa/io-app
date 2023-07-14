import React from "react";
import { render } from "@testing-library/react-native";
import ItwActionCompleted from "../ItwActionCompleted";

type Props = {
  title: string;
  content: string;
};

describe("Test ItwActionCompleted animated indicator", () => {
  it("should match snapshot", () => {
    const props = {
      title: "TITLE",
      content: "CONTENT"
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render correctly with all props", () => {
    const props = {
      title: "TITLE",
      content: "CONTENT"
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.getByTestId("ItwActionCompletedTestID")).toBeTruthy();
  });
  it("should render a title and content correctly", () => {
    const props = {
      title: "TITLE",
      content: "CONTENT"
    };

    const component = renderComponent({ ...props });
    expect(component.getByTestId("ItwActionCompletedTitleTestID")).toBeTruthy();
    expect(
      component.getByTestId("ItwActionCompletedContentTestID")
    ).toBeTruthy();
  });
});

const renderComponent = ({ title, content }: Props) =>
  render(<ItwActionCompleted title={title} content={content} />);
