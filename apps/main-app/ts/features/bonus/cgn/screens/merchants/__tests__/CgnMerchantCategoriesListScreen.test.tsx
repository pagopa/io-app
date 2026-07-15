import { IOToast } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { useEffect } from "react";
import { FlatList, View } from "react-native";
import { createStore } from "redux";

import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { CgnMerchantCategoriesListScreen } from "../CgnMerchantCategoriesListScreen";

jest.mock("../../../components/CgnAnimatedBackground", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    CgnAnimatedBackground: () =>
      React.createElement(View, { testID: "cgn-animated-background-mock" })
  };
});

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

const baseState = appReducer(undefined, applicationChangeState("active"));

const makeCategory = (
  category: ProductCategoryWithNewDiscountsCount["productCategory"],
  newDiscounts = 0
): ProductCategoryWithNewDiscountsCount => ({
  productCategory: category,
  newDiscounts
});

const buildState = (
  overrides: Partial<GlobalState["bonus"]["cgn"]["categories"]> = {}
): GlobalState => ({
  ...baseState,
  bonus: {
    ...baseState.bonus,
    cgn: {
      ...baseState.bonus.cgn,
      categories: {
        ...baseState.bonus.cgn.categories,
        ...overrides
      }
    }
  }
});

const renderScreen = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  // Thin wrapper that actually calls the hook and renders its items
  const Wrapper = () => {
    const screen = CgnMerchantCategoriesListScreen();
    return (
      <FlatList
        data={screen.data}
        keyExtractor={(item: any) => item.productCategory}
        ListEmptyComponent={screen.ListEmptyComponent}
        ListFooterComponent={screen.ListFooterComponent}
        renderItem={({ item, index }: { index: number; item: any }) =>
          screen.renderItem(item, index)
        }
      />
    );
  };

  return renderScreenWithNavigationStoreContext(
    Wrapper,
    CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES,
    {},
    store
  );
};

describe("CgnMerchantCategoriesListScreen", () => {
  it("renders without crashing when categories are empty", () => {
    const { toJSON } = renderScreen(buildState({ list: pot.some([]) }));
    expect(toJSON()).toBeTruthy();
  });

  it("renders a list item for each category", () => {
    const categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount> = [
      makeCategory(ProductCategoryEnum.cultureAndEntertainment),
      makeCategory(ProductCategoryEnum.health)
    ];

    const { getByText } = renderScreen(
      buildState({ list: pot.some(categories) })
    );

    expect(
      getByText(
        I18n.t("bonus.cgn.merchantDetail.categories.cultureAndEntertainment")
      )
    ).toBeTruthy();
    expect(
      getByText(I18n.t("bonus.cgn.merchantDetail.categories.health"))
    ).toBeTruthy();
  });

  it("shows a news badge when a category has new discounts", () => {
    const categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount> = [
      makeCategory(ProductCategoryEnum.cultureAndEntertainment, 3)
    ];

    const { getAllByText } = renderScreen(
      buildState({ list: pot.some(categories) })
    );

    expect(
      getAllByText(I18n.t("bonus.cgn.merchantsList.news")).length
    ).toBeGreaterThan(0);
  });

  it("does not show a news badge when newDiscounts is 0", () => {
    const categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount> = [
      makeCategory(ProductCategoryEnum.cultureAndEntertainment, 0)
    ];

    const { queryAllByText } = renderScreen(
      buildState({ list: pot.some(categories) })
    );

    expect(queryAllByText(I18n.t("bonus.cgn.merchantsList.news"))).toHaveLength(
      0
    );
  });

  it("dispatches cgnCategories.request on mount", () => {
    const store = createStore(appReducer, baseState as any);
    jest.spyOn(store, "dispatch");

    renderScreenWithNavigationStoreContext(
      () => {
        CgnMerchantCategoriesListScreen();
        return <View />;
      },
      CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES,
      {},
      store
    );

    const dispatched = (store.dispatch as jest.Mock).mock.calls.map(
      ([action]: [any]) => action.type
    );
    expect(dispatched).toContain("CGN_CATEGORIES_REQUEST");
  });

  it("dispatches cgnCategories.request on pull refresh", () => {
    const state = buildState({
      list: pot.some([
        makeCategory(ProductCategoryEnum.cultureAndEntertainment)
      ])
    });
    const store = createStore(appReducer, state as any);
    jest.spyOn(store, "dispatch");

    const Wrapper = () => {
      const screen = CgnMerchantCategoriesListScreen();

      useEffect(() => {
        screen.refreshControlProps.onRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return <View />;
    };

    renderScreenWithNavigationStoreContext(
      Wrapper,
      CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES,
      {},
      store
    );

    const dispatched = (store.dispatch as jest.Mock).mock.calls.map(
      ([action]: [any]) => action.type
    );
    // Two requests: one from the hook's own mount effect, one from our onRefresh call
    expect(
      dispatched.filter((t: string) => t === "CGN_CATEGORIES_REQUEST").length
    ).toBeGreaterThanOrEqual(2);
  });

  it("shows a toast when categories are in error state", () => {
    const toastSpy = jest.spyOn(IOToast, "error");

    const error: NetworkError = {
      kind: "generic",
      value: new Error("test")
    };

    renderScreen(buildState({ list: pot.toError(pot.none, error) }));

    expect(toastSpy).toHaveBeenCalledWith(I18n.t("global.genericError"));
    toastSpy.mockRestore();
  });

  it("returns null for a category with unknown productCategory", () => {
    const invalidCategory: ProductCategoryWithNewDiscountsCount = {
      productCategory: "UNKNOWN_CATEGORY" as ProductCategoryEnum,
      newDiscounts: 0
    };

    const { queryByText } = renderScreen(
      buildState({ list: pot.some([invalidCategory]) })
    );

    // The item should not render any text since getCategorySpecs returns None
    expect(queryByText("UNKNOWN_CATEGORY")).toBeNull();
  });

  it("navigates to category list when a category item is pressed", () => {
    const categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount> = [
      makeCategory(ProductCategoryEnum.cultureAndEntertainment)
    ];

    const { getByText } = renderScreen(
      buildState({ list: pot.some(categories) })
    );

    fireEvent.press(
      getByText(
        I18n.t("bonus.cgn.merchantDetail.categories.cultureAndEntertainment")
      )
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY,
      { category: ProductCategoryEnum.cultureAndEntertainment }
    );
  });
});
