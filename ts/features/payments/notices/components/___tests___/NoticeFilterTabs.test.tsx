import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import {
  NoticeEventsCategoryFilter,
  noticeEventsCategoryFilters
} from "../../types";
import { NoticeFilterTabs } from "../NoticeFilterTabs";

describe("NoticeFilterTabs", () => {
  const mockOnCategorySelected = jest.fn();

  const renderComponent = (selectedCategory: NoticeEventsCategoryFilter) =>
    render(
      <NoticeFilterTabs
        selectedCategory={selectedCategory}
        onCategorySelected={mockOnCategorySelected}
      />
    );

  beforeEach(() => {
    mockOnCategorySelected.mockClear();
  });

  it("should render all category tabs", () => {
    const { getByTestId } = renderComponent(noticeEventsCategoryFilters[0]);

    noticeEventsCategoryFilters.forEach(category => {
      expect(getByTestId(`CategoryTabTestID-${category}`)).toBeTruthy();
    });
  });

  it("should call onCategorySelected with the correct category when a tab is pressed", () => {
    const { getByTestId } = renderComponent(noticeEventsCategoryFilters[0]);

    const newCategory = noticeEventsCategoryFilters[1];
    fireEvent.press(getByTestId(`CategoryTabTestID-${newCategory}`));

    expect(mockOnCategorySelected).toHaveBeenCalledWith(newCategory);
  });

  it("should not call onCategorySelected if the selected tab is pressed again", () => {
    const selectedCategory = noticeEventsCategoryFilters[0];
    const { getByTestId } = renderComponent(selectedCategory);

    fireEvent.press(getByTestId(`CategoryTabTestID-${selectedCategory}`));

    expect(mockOnCategorySelected).not.toHaveBeenCalled();
  });

  it("should highlight the selected category tab", () => {
    const selectedCategory = noticeEventsCategoryFilters[1];
    const { getByTestId } = renderComponent(selectedCategory);

    const selectedTab = getByTestId(`CategoryTabTestID-${selectedCategory}`);
    expect(selectedTab.props.accessibilityState.selected).toBe(true);
  });
});
