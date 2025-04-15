import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import WalletPaymentWebViewScreen from "../WalletPaymentWebViewScreen";

describe("WalletPaymentWebViewScreen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();

  it("snapshot for component", () => {
    const enrichedState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            webViewPayload: {
              url: "https://google.com",
              onSuccess: jest.fn()
            }
          }
        }
      }
    };

    const enrichedStore: ReturnType<typeof mockStore> =
      mockStore(enrichedState);

    const component = render(
      <Provider store={enrichedStore}>
        <WalletPaymentWebViewScreen />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
