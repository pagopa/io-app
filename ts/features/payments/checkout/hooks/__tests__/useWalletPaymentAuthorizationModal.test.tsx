import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getNetworkError } from "../../../../../utils/errors";
import { useWalletPaymentAuthorizationModal } from "../useWalletPaymentAuthorizationModal";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

const mockPayload = {
  transactionId: "12345",
  paymentMethodId: "67890",
  pspId: "pspId",
  isAllCCP: true,
  paymentAmount: 100 as AmountEuroCents,
  paymentFees: 100 as AmountEuroCents
};

const renderHook = (initialState: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(initialState);
  const onAuthorizationOutcome = jest.fn();

  const TestComponent = () => {
    const {
      isError,
      isLoading,
      isPendingAuthorization,
      startPaymentAuthorizaton
    } = useWalletPaymentAuthorizationModal({
      onAuthorizationOutcome
    });

    return (
      <Text
        onPress={() => startPaymentAuthorizaton(mockPayload)}
        testID="hook-result"
      >
        {JSON.stringify({ isError, isLoading, isPendingAuthorization })}
      </Text>
    );
  };

  return render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );
};

describe("useWalletPaymentAuthorizationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultState = appReducer(undefined, applicationChangeState("active"));
  it("should return initial state", () => {
    const { getByText } = renderHook(defaultState);
    const resultText = getByText(
      /{"isError":false,"isLoading":false,"isPendingAuthorization":false}/i
    );
    expect(resultText).toBeTruthy();
  });

  it("should set loading state when startPaymentAuthorization is called", () => {
    const initialState = {
      ...defaultState,
      features: {
        ...defaultState.features,
        payments: {
          ...defaultState.features.payments,
          checkout: {
            ...defaultState.features.payments.checkout,
            authorizationUrl: pot.someLoading("loading")
          }
        }
      }
    };

    const { getByText } = renderHook(initialState);
    const resultText = getByText(
      /{"isError":false,"isLoading":true,"isPendingAuthorization":false}/i
    );
    expect(resultText).toBeTruthy();
  });

  it("should set error state when startPaymentAuthorization is called", () => {
    const genericError = getNetworkError("Generic Error");

    const initialState = {
      ...defaultState,
      features: {
        ...defaultState.features,
        payments: {
          ...defaultState.features.payments,
          checkout: {
            ...defaultState.features.payments.checkout,
            authorizationUrl: pot.someError("error", genericError)
          }
        }
      }
    };

    const { getByText } = renderHook(initialState);
    const resultText = getByText(
      /{"isError":true,"isLoading":false,"isPendingAuthorization":false}/i
    );
    expect(resultText).toBeTruthy();
  });
});
