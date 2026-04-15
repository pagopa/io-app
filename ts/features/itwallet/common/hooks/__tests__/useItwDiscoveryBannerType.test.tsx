import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as itwPreferencesSelectors from "../../../common/store/selectors/preferences";
import { useItwDiscoveryBannerType } from "../useItwDiscoveryBannerType";

describe("useItwDiscoveryBannerType", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when isWalletInstanceRemotelyActive is undefined", () => {
    jest
      .spyOn(
        itwPreferencesSelectors,
        "itwIsWalletInstanceRemotelyActiveSelector"
      )
      .mockImplementation(() => undefined);

    const result = renderHook();
    expect(result).toBeUndefined();
  });

  it("should return 'reactivating' when isWalletInstanceRemotelyActive is true", () => {
    jest
      .spyOn(
        itwPreferencesSelectors,
        "itwIsWalletInstanceRemotelyActiveSelector"
      )
      .mockImplementation(() => true);

    const result = renderHook();
    expect(result).toBe("reactivating");
  });

  it("should return 'onboarding' when isWalletInstanceRemotelyActive is false", () => {
    jest
      .spyOn(
        itwPreferencesSelectors,
        "itwIsWalletInstanceRemotelyActiveSelector"
      )
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
