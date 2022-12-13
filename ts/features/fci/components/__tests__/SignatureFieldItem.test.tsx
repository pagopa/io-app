import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import SignatureFieldItem from "../SignatureFieldItem";
import I18n from "../../../../i18n";

type Props = {
  title: string;
  value?: boolean;
  onChange: (_: boolean) => void;
  onPressDetail: () => void;
};

describe("Test SignatureFieldItem component", () => {
  it("should render a SignatureFieldItem component with props correctly", () => {
    const props = {
      title: "Clause title 1",
      onChange: jest.fn(),
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a SignatureFieldItem component with right title 'Clause title 1'", () => {
    const props = {
      title: "Clause title 1",
      onChange: jest.fn(),
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("Clause title 1")).toBeTruthy();
  });
  it("should render a SignatureFieldItem component with checkbox unchecked", () => {
    const props = {
      title: "Clause title 1",
      onChange: jest.fn(),
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("SignatureFieldItemCheckboxTestID")
    ).toBeTruthy();
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
  });
  it("should render a SignatureFieldItem component with checkbox checked", () => {
    const props = {
      title: "Clause title 1",
      value: true,
      onChange: jest.fn(),
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("SignatureFieldItemCheckboxTestID")
    ).toBeTruthy();
    expect(component.queryAllByText("io-checkbox-on")).toBeTruthy();
  });
  it("should render a SignatureFieldItem component with checkbox clickable", () => {
    const onPress = jest.fn();
    const props = {
      title: "Clause title 1",
      value: true,
      onChange: onPress,
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const rightButton = component.getByTestId("SignatureFieldItemButtonTestID");
    expect(rightButton).toBeTruthy();
    expect(rightButton).toBeEnabled();
    fireEvent.press(rightButton);
    expect(component.queryAllByText("io-checkbox-on")).toBeTruthy();
    fireEvent.press(rightButton);
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(2);
  });
  it("should render a SignatureFieldItem component with right text for details link", () => {
    const props = {
      title: "Clause title 1",
      value: true,
      onChange: jest.fn(),
      onPressDetail: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const detailsLink = component.queryAllByText(
      I18n.t("features.fci.signatureFields.showOnDocument")
    );
    expect(detailsLink).toBeTruthy();
  });
  it("should render a SignatureFieldItem component with details link clickable", () => {
    const onPress = jest.fn();
    const props = {
      title: "Clause title 1",
      value: true,
      onChange: jest.fn(),
      onPressDetail: onPress
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    const detailsLink = component.getByTestId("SignatureFieldItemDetailTestID");
    expect(detailsLink).toBeTruthy();
    fireEvent.press(detailsLink);
    fireEvent.press(detailsLink);
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});

const renderComponent = (props: Props) =>
  render(<SignatureFieldItem {...props} />);
