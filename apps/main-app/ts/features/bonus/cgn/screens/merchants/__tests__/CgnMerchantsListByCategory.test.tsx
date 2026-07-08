import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import {
  remoteError,
  remoteReady
} from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import * as IOHooks from "../../../../../../store/hooks";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants
} from "../../../store/actions/merchants";
import * as merchantsSelectors from "../../../store/reducers/merchants";
import CgnMerchantsListByCategory from "../CgnMerchantsListByCategory";

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: (config: unknown) => mockUseHeaderSecondLevel(config)
}));

jest.mock("../../../components/merchants/CgnMerchantsListView", () => ({
  CgnMerchantListViewRenderItem:
    ({ onItemPress }: { onItemPress: (id: string) => void }) =>
    ({ item }: { item: { id: string; name: string } }) =>
      require("react").createElement(
        require("react-native").Pressable,
        { onPress: () => onItemPress(item.id) },
        require("react").createElement(
          require("react-native").Text,
          null,
          item.name
        )
      )
}));

jest.mock("../../../components/merchants/CgnMerchantListSkeleton", () => ({
  CgnMerchantListSkeleton: () => null
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate })
}));

const mockDispatch = jest.fn();
const mockUseHeaderSecondLevel = jest.fn();
const mockNavigate = jest.fn();

const category = "cultureAndEntertainment" as any;

describe("CgnMerchantsListByCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest
      .spyOn(merchantsSelectors, "cgnOnlineMerchantsSelector")
      .mockReturnValue(
        remoteReady([{ id: "online-1", name: "Online merchant" }]) as never
      );
    jest
      .spyOn(merchantsSelectors, "cgnOfflineMerchantsSelector")
      .mockReturnValue(
        remoteReady([{ id: "offline-1", name: "Offline merchant" }]) as never
      );
  });

  it("dispatches merchant requests on mount and opens merchant detail on item press", () => {
    const { getByText } = renderComponent();

    expect(mockDispatch).toHaveBeenCalledWith(
      cgnOfflineMerchants.request({ productCategories: [category] })
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      cgnOnlineMerchants.request({ productCategories: [category] })
    );

    fireEvent.press(getByText("Online merchant"));
    expect(mockNavigate).toHaveBeenCalledWith(
      CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
      {
        merchantID: "online-1"
      }
    );
  });

  it("shows retry result screen when both lists are in error and retries on CTA", () => {
    jest
      .spyOn(merchantsSelectors, "cgnOnlineMerchantsSelector")
      .mockReturnValue(remoteError(new Error("boom")) as never);
    jest
      .spyOn(merchantsSelectors, "cgnOfflineMerchantsSelector")
      .mockReturnValue(remoteError(new Error("boom")) as never);

    const { getByText } = renderComponent();

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(mockDispatch).toHaveBeenCalledWith(
      cgnOfflineMerchants.request({ productCategories: [category] })
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      cgnOnlineMerchants.request({ productCategories: [category] })
    );
  });

  it("registers a search action in the second level header", () => {
    renderComponent();

    const config = mockUseHeaderSecondLevel.mock.calls[0][0];
    config.secondAction.onPress();

    expect(mockNavigate).toHaveBeenCalledWith(
      CGN_ROUTES.DETAILS.MERCHANTS.SEARCH
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    CgnMerchantsListByCategory,
    CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY,
    { category },
    store
  );
};
