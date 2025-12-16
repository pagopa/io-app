import { fireEvent, render } from "@testing-library/react-native";
import { ReceiptsCategoryFilter, receiptsCategoryFilters } from "../../types";
import { ReceiptFilterTabs } from "../ReceiptFilterTabs";

describe("ReceiptFilterTabs", () => {
  const mockOnCategorySelected = jest.fn();

  const renderComponent = (selectedCategory: ReceiptsCategoryFilter) =>
    render(
      <ReceiptFilterTabs
        selectedCategory={selectedCategory}
        onCategorySelected={mockOnCategorySelected}
      />
    );

  beforeEach(() => {
    mockOnCategorySelected.mockClear();
  });

  it("should render all category tabs", () => {
    const { getByTestId } = renderComponent(receiptsCategoryFilters[0]);

    receiptsCategoryFilters.forEach(category => {
      expect(getByTestId(`CategoryTabTestID-${category}`)).toBeTruthy();
    });
  });

  it("should call onCategorySelected with the correct category when a tab is pressed", () => {
    const { getByTestId } = renderComponent(receiptsCategoryFilters[0]);

    const newCategory = receiptsCategoryFilters[1];
    fireEvent.press(getByTestId(`CategoryTabTestID-${newCategory}`));

    expect(mockOnCategorySelected).toHaveBeenCalledWith(newCategory);
  });

  it("should not call onCategorySelected if the selected tab is pressed again", () => {
    const selectedCategory = receiptsCategoryFilters[0];
    const { getByTestId } = renderComponent(selectedCategory);

    fireEvent.press(getByTestId(`CategoryTabTestID-${selectedCategory}`));

    expect(mockOnCategorySelected).not.toHaveBeenCalled();
  });

  it("should highlight the selected category tab", () => {
    const selectedCategory = receiptsCategoryFilters[1];
    const { getByTestId } = renderComponent(selectedCategory);

    const selectedTab = getByTestId(`CategoryTabTestID-${selectedCategory}`);
    expect(selectedTab.props.accessibilityState.checked).toBe(true);
  });
});
