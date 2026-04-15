import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  WalletCardsCategoryContainer,
  WalletCardsCategoryContainerProps
} from "../WalletCardsCategoryContainer";

describe("WalletCardsCategoryContainer", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  const T_KEY = "12345";

  it("should correctly render the component", () => {
    const { queryByTestId } = renderComponent({
      cards: [
        { key: T_KEY, type: "payment", category: "payment", walletId: "" }
      ]
    });
    expect(
      queryByTestId(`walletCardTestID_payment_payment_${T_KEY}`)
    ).not.toBeNull();
  });
});

const renderComponent = (props: WalletCardsCategoryContainerProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <WalletCardsCategoryContainer {...props} />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
