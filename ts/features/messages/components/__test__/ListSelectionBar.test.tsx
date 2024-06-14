import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import I18n from "../../../../i18n";
import ListSelectionBar from "../Home/legacy/ListSelectionBar";

jest.useFakeTimers();

const defaultProps = {
  onResetSelection: jest.fn(),
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
});
