import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import DocumentsNavigationBar from "../DocumentsNavigationBar";
import { IOColors } from "../../../../components/core/variables/IOColors";

type Props = {
  titleRight: string;
  titleLeft: string;
  iconRightColor?: string;
  iconLeftColor?: string;
  onPrevious: () => void;
  onNext: () => void;
};

describe("Test DocumentsNavigationBar component", () => {
  it("should render a DocumentsNavigationBar Component with props correctly", () => {
    const props = {
      titleRight: "Pagina 1 di 2",
      titleLeft: "Documento 1 di 2",
      iconRightColor: IOColors.blue,
      iconLeftColor: IOColors.blue,
      onPrevious: jest.fn(),
      onNext: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a DocumentsNavigationBar Component with titleRight as 'Page 1 of 2'", () => {
    const props = {
      titleRight: "Page 1 of 2",
      titleLeft: "",
      onPrevious: jest.fn(),
      onNext: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("Page 1 of 2")).toBeTruthy();
  });
  it("should render a DocumentsNavigationBar Component with titleLeft as 'Document 1 of 5'", () => {
    const props = {
      titleRight: "",
      titleLeft: "Document 1 of 5",
      onPrevious: jest.fn(),
      onNext: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("Document 1 of 5")).toBeTruthy();
  });
  it("should render a DocumentsNavigationBar Component with onPrevious button clickable", () => {
    const onPress = jest.fn();
    const props = {
      titleRight: "",
      titleLeft: "",
      onPrevious: onPress,
      onNext: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const leftButton = component.getByTestId(
      "DocumentsNavigationBarLeftButtonTestID"
    );
    expect(leftButton).toBeTruthy();
    expect(leftButton).toBeEnabled();
    fireEvent.press(leftButton);
    fireEvent.press(leftButton);
    expect(onPress).toHaveBeenCalledTimes(2);
  });
  it("should render a DocumentsNavigationBar Component with onNext button clickable", () => {
    const onPress = jest.fn();
    const props = {
      titleRight: "",
      titleLeft: "",
      onPrevious: jest.fn(),
      onNext: onPress
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const rightButton = component.getByTestId(
      "DocumentsNavigationBarRightButtonTestID"
    );
    expect(rightButton).toBeTruthy();
    expect(rightButton).toBeEnabled();
    fireEvent.press(rightButton);
    fireEvent.press(rightButton);
    expect(onPress).toHaveBeenCalledTimes(2);
  });
  it("should render a DocumentsNavigationBar Component with right arrow button disabled", () => {
    const onPress = jest.fn();
    const props = {
      titleRight: "",
      titleLeft: "",
      disabled: true,
      onPrevious: jest.fn(),
      onNext: onPress
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const rightButton = component.getByTestId(
      "DocumentsNavigationBarRightButtonTestID"
    );
    expect(rightButton).toBeTruthy();
    expect(rightButton).toBeDisabled();
    fireEvent.press(rightButton);
    fireEvent.press(rightButton);
    expect(onPress).toHaveBeenCalledTimes(0);
  });
  it("should render a DocumentsNavigationBar Component with left arrow button disabled", () => {
    const onPress = jest.fn();
    const props = {
      titleRight: "",
      titleLeft: "",
      disabled: true,
      onPrevious: jest.fn(),
      onNext: onPress
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const leftButton = component.getByTestId(
      "DocumentsNavigationBarLeftButtonTestID"
    );
    expect(leftButton).toBeTruthy();
    expect(leftButton).toBeDisabled();
    fireEvent.press(leftButton);
    fireEvent.press(leftButton);
    expect(onPress).toHaveBeenCalledTimes(0);
  });
});

const renderComponent = (props: Props) =>
  render(<DocumentsNavigationBar {...props} />);
