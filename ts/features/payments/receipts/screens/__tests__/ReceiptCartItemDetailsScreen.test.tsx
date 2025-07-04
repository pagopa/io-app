import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { CartItem } from "../../../../../../definitions/pagopa/biz-events/CartItem";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import ReceiptCartItemDetailsScreen from "../ReceiptCartItemDetailsScreen";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

const renderComponent = (state: GlobalState, cartItem: CartItem) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ReceiptCartItemDetailsScreen,
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_CART_ITEM_DETAILS,
    { cartItem },
    store
  );
};
const globalState = appReducer(undefined, applicationChangeState("active"));

const mockClipboard = clipboardSetStringWithFeedback as jest.Mock;

const cartItem: CartItem = {
  subject: "Test Cart Item",
  amount: "100.00",
  refNumberValue: "1234567890",
  refNumberType: "testType",
  payee: { name: "Test Payee", taxCode: "PAYEETAX123" },
  debtor: { name: "Test Debtor", taxCode: "DEBTORTAX123" }
};

describe("ReceiptCartItemDetailsScreen", () => {
  it("should display refNumberValue and payee tax code, and copy refNumberValue on press", () => {
    const { getByText } = renderComponent(globalState, cartItem);
    const refNumberText = getByText("1234567890");

    expect(refNumberText).toBeTruthy();
    expect(getByText("PAYEETAX123")).toBeTruthy();

    fireEvent.press(refNumberText);
    expect(mockClipboard).toHaveBeenCalledWith(cartItem.refNumberValue);
  });

  it("should not display refNumberValue if payee taxCode not present", () => {
    const cartItemWithoutPayeeTaxCode = {
      ...cartItem,
      payee: undefined
    };
    const { queryByText } = renderComponent(
      globalState,
      cartItemWithoutPayeeTaxCode
    );

    expect(queryByText("PAYEETAX123")).toBeNull();
  });
});
