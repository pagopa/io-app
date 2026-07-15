import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as itwWalletInstanceSelectors from "../../../walletInstance/store/selectors";
import { useItwDiscoveryBannerType } from "../useItwDiscoveryBannerType";

describe("useItwDiscoveryBannerType", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when isRemotelyActive is undefined", () => {
    jest
      .spyOn(itwWalletInstanceSelectors, "itwIsRemotelyActiveSelector")
      .mockImplementation(() => undefined);

    const result = renderHook();
    expect(result).toBeUndefined();
  });

  it("should return 'reactivating' when isRemotelyActive is true", () => {
    jest
      .spyOn(itwWalletInstanceSelectors, "itwIsRemotelyActiveSelector")
      .mockImplementation(() => true);

    const result = renderHook();
    expect(result).toBe("reactivating");
  });

  it("should return 'onboarding' when isRemotelyActive is false", () => {
    jest
      .spyOn(itwWalletInstanceSelectors, "itwIsRemotelyActiveSelector")
      .mockImplementation(() => false);

    const result = renderHook();
    expect(result).toBe("onboarding");
  });
});

const renderHook = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(initialState);

  // Create a TestComponent that renders the hook result as text content
  function TestComponent() {
    const hookResult = useItwDiscoveryBannerType();

    return <Text testID="hook-result">{hookResult}</Text>;
  }

  // Render the component
  const { getByTestId } = render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );

  const resultElement = getByTestId("hook-result");
  return resultElement.props.children;
};
