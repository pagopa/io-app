import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import { ReceiptDetailsScreen } from "../ReceiptDetailsScreen";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ReceiptDetailsScreen,
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS,
    {},
    store
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("ReceiptDetailsScreen", () => {
  it("should render correctly", () => {
    const component = renderComponent(globalState);
    expect(component).toBeDefined();
  });

  it("should render loading skeleton when receipt is loading", () => {
    const loadingState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            details: pot.someLoading([])
          }
        }
      }
    };
    const component = renderComponent(loadingState);
    expect(
      component.getByTestId("skeleton-transaction-details-list")
    ).toBeDefined();
    expect(component.getAllByTestId("skeleton-item")).toHaveLength(5);
  });
});
