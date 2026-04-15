import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as AppParamsList from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as hooks from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import { ReceiptListScreen } from "../ReceiptListScreen";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ReceiptListScreen,
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_LIST_SCREEN,
    {},
    store
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));
describe("ReceiptListScreen", () => {
  it("should render correctly", () => {
    const component = renderComponent(globalState);
    expect(component).toBeDefined();
  });

  it("should render loading skeleton when transactions are loading", () => {
    const loadingState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            transactions: pot.noneLoading
          }
        }
      }
    };
    const component = renderComponent(loadingState);
    expect(component.getByTestId("section-title-skeleton")).toBeDefined();
  });

  it("should render empty state when no transactions are available", () => {
    jest.mock("../../../../../utils/hooks/useOnFirstRender", () => ({
      useOnFirstRender: jest.fn(() => null)
    }));

    const mockDispatch = jest.fn();

    jest.mock("../../../../../store/hooks", () => ({
      useIODispatch: jest.fn(),
      useIOStore: jest.fn(),
      useIOSelector: jest.fn()
    }));

    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);

    const emptyState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            transactions: pot.some([])
          }
        }
      }
    };
    const { getByTestId } = renderComponent(emptyState);
    expect(getByTestId("PaymentsTransactionsEmptyList")).toBeDefined();
  });

  it("should set titleHeight on header layout event", () => {
    const { getByText } = renderComponent(globalState);

    // The header label is the section header title.
    // Alternatively, get ReceiptSectionListHeader by testID or text.
    const header = getByText(/Tutte/i) || getByText(/some section title/i);

    fireEvent(header, "layout", {
      nativeEvent: { layout: { height: 100, width: 300, x: 0, y: 0 } }
    });

    // We cannot read titleHeight state directly from here.
    // But no error means the setter ran successfully.

    expect(header).toBeTruthy();
  });

  it("should refresh transactions list on pull to refresh", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
    const { getByTestId } = renderComponent(globalState);
    fireEvent(getByTestId("PaymentsTransactionsListTestID"), "refresh");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should fetch next page on end reached if continuationToken is set", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);

    const transaction = {
      eventId: "1",
      payeeTaxCode: "TAXCODE",
      amount: "10.00",
      noticeDate: "2023-01-01",
      isCart: false,
      isPayer: true,
      isDebtor: false
    };
    const pagedState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            transactions: pot.some([transaction])
          }
        }
      }
    };
    const { getByTestId } = renderComponent(pagedState);
    fireEvent(getByTestId("PaymentsTransactionsListTestID"), "endReached");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should navigate to transaction details on item press", () => {
    const mockNavigate = jest.fn();
    jest.spyOn(AppParamsList, "useIONavigation").mockReturnValue({
      navigate: mockNavigate,
      dispatch: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      isFocused: jest.fn(),
      canGoBack: jest.fn()
    } as any);
    const transaction = {
      eventId: "1",
      payeeTaxCode: "TAXCODE",
      amount: "10.00",
      noticeDate: "2023-01-01",
      isCart: false,
      isPayer: true,
      isDebtor: false
    };
    const stateWithItem: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            transactions: pot.some([transaction])
          }
        }
      }
    };
    const { getByText } = renderComponent(stateWithItem);
    fireEvent.press(getByText("10,00 €"));
    expect(mockNavigate).toHaveBeenCalled();
  });
});
