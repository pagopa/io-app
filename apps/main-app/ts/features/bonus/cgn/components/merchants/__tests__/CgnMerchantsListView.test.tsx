import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { DiscountCodeTypeEnum } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { OnlineMerchant } from "../../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import { CgnMerchantListViewRenderItem } from "../CgnMerchantsListView";

const mockOnItemPress = jest.fn();

const baseMerchant: OnlineMerchant = {
  id: "merchant-1" as NonEmptyString,
  name: "Test Merchant" as NonEmptyString,
  productCategories: [ProductCategoryEnum.cultureAndEntertainment],
  websiteUrl: "https://example.com" as NonEmptyString,
  discountCodeType: DiscountCodeTypeEnum.static,
  newDiscounts: false
};

const renderItem = (
  item: OnlineMerchant,
  index: number = 0,
  count: number = 1
) => {
  const renderFn = CgnMerchantListViewRenderItem({
    onItemPress: mockOnItemPress,
    count
  });
  const element = renderFn({ item, index, separators: {} as any });
  return render(<>{element}</>);
};

describe("CgnMerchantsListView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the merchant name", () => {
    const { getByText } = renderItem(baseMerchant);
    expect(getByText("Test Merchant")).toBeTruthy();
  });

  it("should not show a badge when newDiscounts is false", () => {
    const { queryByText } = renderItem(baseMerchant);
    expect(queryByText(/\d+/)).toBeNull();
  });

  it("should show a news badge when newDiscounts is true without count", () => {
    const { getByText } = renderItem({
      ...baseMerchant,
      newDiscounts: true
    });
    expect(getByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
  });

  it("should call onItemPress with the merchant id when pressed", () => {
    const { getByText } = renderItem(baseMerchant);
    fireEvent.press(getByText("Test Merchant"));
    expect(mockOnItemPress).toHaveBeenCalledWith("merchant-1");
  });
});
