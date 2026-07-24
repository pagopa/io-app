import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { FlatList, View } from "react-native";
import { createStore } from "redux";

import { DiscountCodeTypeEnum } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { OfflineMerchant } from "../../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import {
  remoteError,
  remoteReady
} from "../../../../../../common/model/RemoteValue";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { CgnMerchantsListScreen } from "../CgnMerchantsListScreen";

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: jest.fn()
}));

jest.mock("../../../components/CgnAnimatedBackground", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    CgnAnimatedBackground: () =>
      React.createElement(View, { testID: "cgn-animated-background-mock" })
  };
});

const mockNavigate = jest.fn();
(useIONavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

const baseState = appReducer(undefined, applicationChangeState("active"));

const makeOnlineMerchant = (
  id: string,
  name: string,
  newDiscounts = false
): OnlineMerchant => ({
  id: id as NonEmptyString,
  name: name as NonEmptyString,
  productCategories: [ProductCategoryEnum.cultureAndEntertainment],
  websiteUrl: "https://example.com" as NonEmptyString,
  discountCodeType: DiscountCodeTypeEnum.static,
  newDiscounts
});

const makeOfflineMerchant = (
  id: string,
  name: string,
  newDiscounts = false
): OfflineMerchant => ({
  id: id as NonEmptyString,
  name: name as NonEmptyString,
  productCategories: [ProductCategoryEnum.health],
  address: { full_address: "Via Roma 1" as NonEmptyString },
  newDiscounts
});

const buildState = (
  overrides: Partial<GlobalState["bonus"]["cgn"]["merchants"]> = {}
): GlobalState => ({
  ...baseState,
  bonus: {
    ...baseState.bonus,
    cgn: {
      ...baseState.bonus.cgn,
      merchants: {
        ...baseState.bonus.cgn.merchants,
        ...overrides
      }
    }
  }
});

const renderScreen = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  const Wrapper = () => {
    const screen = CgnMerchantsListScreen();
    return (
      <FlatList
        data={screen.data}
        keyExtractor={(item: any) => item.id}
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

describe("CgnMerchantsListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIONavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it("renders without crashing when merchants lists are empty", () => {
    const { toJSON } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([]),
        offlineMerchants: remoteReady([])
      })
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders merchant names from online and offline lists", () => {
    const { getByText } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([makeOnlineMerchant("o1", "Online Shop")]),
        offlineMerchants: remoteReady([
          makeOfflineMerchant("f1", "Offline Store")
        ])
      })
    );

    expect(getByText("Online Shop")).toBeTruthy();
    expect(getByText("Offline Store")).toBeTruthy();
  });

  it("shows a news badge for merchants with new discounts", () => {
    const { getAllByText } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([
          makeOnlineMerchant("o1", "Sale Merchant", true)
        ]),
        offlineMerchants: remoteReady([])
      })
    );

    expect(
      getAllByText(I18n.t("bonus.cgn.merchantsList.news")).length
    ).toBeGreaterThan(0);
  });

  it("does not show a news badge for merchants without new discounts", () => {
    const { queryAllByText } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([makeOnlineMerchant("o1", "Normal Shop")]),
        offlineMerchants: remoteReady([])
      })
    );

    expect(queryAllByText(I18n.t("bonus.cgn.merchantsList.news"))).toHaveLength(
      0
    );
  });

  it("shows error state when online merchants request fails", () => {
    const { getByText } = renderScreen(
      buildState({
        onlineMerchants: remoteError({
          kind: "generic",
          value: new Error("test")
        }),
        offlineMerchants: remoteReady([])
      })
    );

    expect(
      getByText(I18n.t("wallet.payment.outcome.GENERIC_ERROR.title"))
    ).toBeTruthy();
  });

  it("shows error state when offline merchants request fails", () => {
    const { getByText } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([]),
        offlineMerchants: remoteError({
          kind: "generic",
          value: new Error("test")
        })
      })
    );

    expect(
      getByText(I18n.t("wallet.payment.outcome.GENERIC_ERROR.title"))
    ).toBeTruthy();
  });

  it("navigates to merchant detail when an item is pressed", () => {
    const merchant = makeOnlineMerchant("merchant-1", "Pressable Shop");

    const { getByText } = renderScreen(
      buildState({
        onlineMerchants: remoteReady([merchant]),
        offlineMerchants: remoteReady([])
      })
    );

    fireEvent.press(getByText("Pressable Shop"));

    expect(mockNavigate).toHaveBeenCalledWith(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
      params: { merchantID: "merchant-1" }
    });
  });

  it("dispatches online and offline merchants requests on focus", () => {
    (useFocusEffect as jest.Mock).mockImplementation((cb: () => void) => {
      cb();
    });

    const store = createStore(appReducer, baseState as any);
    jest.spyOn(store, "dispatch");

    renderScreenWithNavigationStoreContext(
      () => {
        CgnMerchantsListScreen();
        return <View />;
      },
      CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES,
      {},
      store
    );

    const dispatchedTypes = (store.dispatch as jest.Mock).mock.calls.map(
      ([action]: [any]) => action.type
    );
    expect(dispatchedTypes).toContain("CGN_ONLINE_MERCHANTS_REQUEST");
    expect(dispatchedTypes).toContain("CGN_OFFLINE_MERCHANTS_REQUEST");
  });
});
