import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import {
  PaymentBizEventsCategoryFilter,
  paymentsBizEventsCategoryFilters
} from "../../types";
import { PaymentsBizEventsFilterTabs } from "../PaymentsBizEventsFilterTabs";

describe("PaymentsBizEventsFilterTabs", () => {
  const mockOnCategorySelected = jest.fn();

  const renderComponent = (selectedCategory: PaymentBizEventsCategoryFilter) =>
    render(
      <PaymentsBizEventsFilterTabs
        selectedCategory={selectedCategory}
        onCategorySelected={mockOnCategorySelected}
      />
    );

  beforeEach(() => {
    mockOnCategorySelected.mockClear();
  });

  it("should render all category tabs", () => {
    const { getByTestId } = renderComponent(
      paymentsBizEventsCategoryFilters[0]
    );

    paymentsBizEventsCategoryFilters.forEach(category => {
      expect(getByTestId(`CategoryTabTestID-${category}`)).toBeTruthy();
    });
  });

  it("should call onCategorySelected with the correct category when a tab is pressed", () => {
    const { getByTestId } = renderComponent(
      paymentsBizEventsCategoryFilters[0]
    );

    const newCategory = paymentsBizEventsCategoryFilters[1];
    fireEvent.press(getByTestId(`CategoryTabTestID-${newCategory}`));

    expect(mockOnCategorySelected).toHaveBeenCalledWith(newCategory);
  });

  it("should not call onCategorySelected if the selected tab is pressed again", () => {
    const selectedCategory = paymentsBizEventsCategoryFilters[0];
    const { getByTestId } = renderComponent(selectedCategory);

    fireEvent.press(getByTestId(`CategoryTabTestID-${selectedCategory}`));

    expect(mockOnCategorySelected).not.toHaveBeenCalled();
  });

  it("should highlight the selected category tab", () => {
    const selectedCategory = paymentsBizEventsCategoryFilters[1];
    const { getByTestId } = renderComponent(selectedCategory);

    const selectedTab = getByTestId(`CategoryTabTestID-${selectedCategory}`);
    expect(selectedTab.props.accessibilityState.selected).toBe(true);
  });
});
