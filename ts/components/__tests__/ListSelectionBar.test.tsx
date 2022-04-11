import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import I18n from "../../i18n";
import ListSelectionBar from "../ListSelectionBar";

jest.useFakeTimers();

const defaultProps = {
  onResetSelection: jest.fn(),
  onToggleAllSelection: jest.fn(),
  onToggleSelection: jest.fn(),
  primaryButtonText: "archive",
  totalItems: 3,
  selectedItems: 1
};

describe("ListSelectionBar component", () => {
  it("should match the snapshot with default props", () => {
    expect(
      render(<ListSelectionBar {...defaultProps} />).toJSON()
    ).toMatchSnapshot();
  });

  describe("when there are no selected items", () => {
    it("should render the primary button, disabled", () => {
      const onToggleSelectionSpy = jest.fn();
      const { getByText } = render(
        <ListSelectionBar
          {...defaultProps}
          onToggleSelection={onToggleSelectionSpy}
          selectedItems={0}
        />
      );
      const primaryBtn = getByText(defaultProps.primaryButtonText);
      fireEvent(primaryBtn, "onPress");
      expect(onToggleSelectionSpy).not.toHaveBeenCalled();
    });
  });

  describe("when selected items is greater than 0", () => {
    it("should render the primary button, enabled", () => {
      const onToggleSelectionSpy = jest.fn();
      const { getByText } = render(
        <ListSelectionBar
          {...defaultProps}
          onToggleSelection={onToggleSelectionSpy}
        />
      );
      const primaryBtn = getByText(defaultProps.primaryButtonText);
      fireEvent(primaryBtn, "onPress");
      expect(onToggleSelectionSpy).toHaveBeenCalled();
    });
  });

  describe("when selected items are the same as total items", () => {
    it("should render 'deselect all messages' button", () => {
      const { findByText } = render(<ListSelectionBar {...defaultProps} />);
      expect(findByText(I18n.t("messages.cta.deselectAll"))).not.toBeNull();
    });
  });

  describe("when onToggleAllSelection is undefined", () => {
    const props = {
      ...defaultProps,
      onToggleAllSelection: undefined
    };

    it("should not render the 'select all messages' button", () => {
      const component = render(<ListSelectionBar {...props} />);
      expect(component.queryByTestId("toggleAllSelection")).toBeNull();
    });
  });
});
