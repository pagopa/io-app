import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { act } from "@testing-library/react-native";
import { createStore } from "redux";

import I18n from "i18next";
import { Merchant } from "../../../../../../../definitions/cgn/merchants/Merchant";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { cgnSelectedMerchant } from "../../../store/actions/merchants";
import CgnMerchantDetailScreen from "../CgnMerchantDetailScreen";

const baseMerchant: Merchant = {
  id: "merchant-1" as NonEmptyString,
  name: "Test Merchant" as NonEmptyString,
  discounts: [
    {
      id: "discount-1" as NonEmptyString,
      name: "10% off" as NonEmptyString,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      productCategories: [ProductCategoryEnum.cultureAndEntertainment]
    }
  ],
  allNationalAddresses: false
};

const renderComponent = (merchant?: Merchant) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  const result = renderScreenWithNavigationStoreContext(
    CgnMerchantDetailScreen,
    CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
    { merchantID: "merchant-1" },
    store
  );

  if (merchant) {
    act(() => {
      store.dispatch(cgnSelectedMerchant.success(merchant));
    });
  }

  return { ...result, store };
};

describe("CgnMerchantDetailScreen", () => {
  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("should render the description when provided", () => {
    const merchant: Merchant = {
      ...baseMerchant,
      description: "A merchant" as NonEmptyString
    };
    const { getByText } = renderComponent(merchant);
    expect(getByText("A merchant")).toBeTruthy();
  });

  it("should render address when addresses are provided", () => {
    const merchant: Merchant = {
      ...baseMerchant,
      addresses: [{ full_address: "Via Roma 1, 00100 Roma" as NonEmptyString }]
    };
    const { getByText } = renderComponent(merchant);
    expect(getByText("Via Roma 1, 00100 Roma")).toBeTruthy();
  });

  it("should render website button when websiteUrl is provided", () => {
    const merchant: Merchant = {
      ...baseMerchant,
      websiteUrl: "https://example.com" as NonEmptyString
    };
    const { getByText } = renderComponent(merchant);
    expect(
      getByText(I18n.t("bonus.cgn.merchantDetail.cta.website"))
    ).toBeTruthy();
  });

  it("should not render website button when websiteUrl is not provided", () => {
    const { queryByText } = renderComponent(baseMerchant);
    expect(
      queryByText(I18n.t("bonus.cgn.merchantDetail.cta.website"))
    ).toBeNull();
  });
});
