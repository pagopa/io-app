import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import * as tourSelectors from "../../../../tour/store/selectors";
import * as ingressSelectors from "../../../../ingress/store/selectors";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { startTourAction } from "../../../../tour/store/actions";
import { ITW_TOUR_GROUP_ID } from "../../utils/constants";
import { useItwGuidedTour } from "../useItwGuidedTour";

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 100
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock("../../../../tour/components/useGuidedTourRegion", () => ({
  useGuidedTourRegion: jest.fn()
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  // Run the focus callback like a plain effect, since the test does not
  // render inside a NavigationContainer.
  useFocusEffect: (callback: () => void) =>
    require("react").useEffect(callback, [callback])
}));

describe("useItwGuidedTour", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts the tour when the wallet is in L3 mode, not completed and not offline", () => {
    const store = renderHook({
      isItWalletValid: true,
      isCompleted: false,
      offlineAccessReason: undefined
    });

    jest.advanceTimersByTime(300);

    expect(store.getActions()).toContainEqual(
      startTourAction({ groupId: ITW_TOUR_GROUP_ID })
    );
  });

  // Non regression test: the tour guide must never start when the wallet is
  // only in L2 mode ("documenti su IO"), even if whitelisted for L3.
  it("does not start the tour when the wallet is not in L3 mode", () => {
    const store = renderHook({
      isItWalletValid: false,
      isCompleted: false,
      offlineAccessReason: undefined
    });

    jest.advanceTimersByTime(300);

    expect(store.getActions()).not.toContainEqual(
      startTourAction({ groupId: ITW_TOUR_GROUP_ID })
    );
  });

  it("does not start the tour when it was already completed", () => {
    const store = renderHook({
      isItWalletValid: true,
      isCompleted: true,
      offlineAccessReason: undefined
    });

    jest.advanceTimersByTime(300);

    expect(store.getActions()).not.toContainEqual(
      startTourAction({ groupId: ITW_TOUR_GROUP_ID })
    );
  });

  it("does not start the tour when the app is in offline mode", () => {
    const store = renderHook({
      isItWalletValid: true,
      isCompleted: false,
      offlineAccessReason: OfflineAccessReasonEnum.TIMEOUT
    });

    jest.advanceTimersByTime(300);

    expect(store.getActions()).not.toContainEqual(
      startTourAction({ groupId: ITW_TOUR_GROUP_ID })
    );
  });
});

type Params = {
  isItWalletValid: boolean;
  isCompleted: boolean;
  offlineAccessReason: OfflineAccessReasonEnum | undefined;
};

const renderHook = ({
  isItWalletValid,
  isCompleted,
  offlineAccessReason
}: Params) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(isItWalletValid);
  jest
    .spyOn(tourSelectors, "isTourCompletedSelector")
    .mockReturnValue(isCompleted);
  jest
    .spyOn(ingressSelectors, "offlineAccessReasonSelector")
    .mockReturnValue(offlineAccessReason);

  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(initialState);

  const TestComponent = () => {
    useItwGuidedTour();
    return null;
  };

  render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );

  return store;
};
