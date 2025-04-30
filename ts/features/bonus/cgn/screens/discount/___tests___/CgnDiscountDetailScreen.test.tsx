import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { Discount } from "../../../../../../../definitions/cgn/Discount";
import { DiscountCodeTypeEnum } from "../../../../../../../definitions/cgn/DiscountCodeType";
import { Merchant } from "../../../../../../../definitions/cgn/Merchant";
import { SupportTypeEnum } from "../../../../../../../definitions/cgn/SupportType";
import { remoteReady } from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { setMerchantDiscountCode } from "../../../store/actions/merchants";
import CgnDiscountDetailScreen from "../CgnDiscountDetailScreen";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return {
    component: renderScreenWithNavigationStoreContext(
      CgnDiscountDetailScreen,
      CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT,
      {},
      store
    ),
    store
  };
};

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn()
  })
}));

const discountDetailsMock: Discount = {
  id: "12345" as NonEmptyString,
  name: "Test Discount" as NonEmptyString,
  startDate: new Date(),
  endDate: new Date(),
  productCategories: [],
  description: "Description of test discount" as NonEmptyString,
  discount: 10,
  condition: "Test condition" as NonEmptyString,
  discountUrl: "https://example.com" as NonEmptyString
};

const mockSelectedMerchant: Merchant = {
  id: "12345" as NonEmptyString,
  name: "Test Merchant" as NonEmptyString,
  description: "Description of test merchant" as NonEmptyString,
  websiteUrl: "https://example.com" as NonEmptyString,
  allNationalAddresses: false,
  discounts: [],
  supportType: SupportTypeEnum.EMAILADDRESS,
  supportValue: "10" as NonEmptyString,
  discountCodeType: DiscountCodeTypeEnum.api
};

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("CgnDiscountDetailScreen", () => {
  it("should render correctly", () => {
    const { component } = renderComponent(globalState);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should navigate to discount code screen on button press", async () => {
    const initialState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        cgn: {
          ...globalState.bonus.cgn,
          merchants: {
            ...globalState.bonus.cgn.merchants,
            selectedDiscount: remoteReady(discountDetailsMock),
            selectedMerchant: remoteReady(mockSelectedMerchant)
          }
        }
      }
    };

    const { component, store } = renderComponent(initialState);

    store.dispatch(setMerchantDiscountCode("12345"));

    fireEvent.press(component.getByTestId("discount-code-button"));

    expect(mockNavigate).toHaveBeenCalledWith(
      CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE
    );
  });

  it("should show footer actions if applicable", () => {
    const initialState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        cgn: {
          ...globalState.bonus.cgn,
          merchants: {
            ...globalState.bonus.cgn.merchants,
            selectedDiscount: remoteReady(discountDetailsMock),
            selectedMerchant: remoteReady(mockSelectedMerchant)
          }
        }
      }
    };

    const { component } = renderComponent(initialState);

    expect(component.getByTestId("discount-code-button")).toBeTruthy();
    expect(component.getByTestId("discount-url-button")).toBeTruthy();
  });

  it("should navigate to landing page webview on button press", async () => {
    const initialState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        cgn: {
          ...globalState.bonus.cgn,
          merchants: {
            ...globalState.bonus.cgn.merchants,
            selectedDiscount: remoteReady({
              ...discountDetailsMock,
              landingPageUrl: "https://example.com/landing" as NonEmptyString,
              landingPageReferrer: "referrer" as NonEmptyString
            }),
            selectedMerchant: remoteReady({
              ...mockSelectedMerchant,
              discountCodeType: DiscountCodeTypeEnum.landingpage
            })
          }
        }
      }
    };

    const { component } = renderComponent(initialState);

    fireEvent.press(component.getByTestId("discount-code-button"));

    expect(mockNavigate).toHaveBeenCalledWith(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW,
      params: {
        landingPageUrl: "https://example.com/landing",
        landingPageReferrer: "referrer"
      }
    });
  });
});
