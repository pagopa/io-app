import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { appReducer } from "../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwDiscoveryLandingScreen } from "../ItwDiscoveryLandingScreen";

const mockReplace = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ replace: mockReplace })
}));

describe("ItwDiscoveryLandingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for authenticated startup before navigating", () => {
    renderComponent(StartupStatusEnum.INITIAL);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  const discoveryInfo = (level: "l2" | "l3") => [
    ITW_ROUTES.DISCOVERY.INFO,
    { animationEnabled: false, level }
  ];

  test.each<{
    expectedArgs: ReadonlyArray<unknown>;
    lifecycle: lifecycleSelectors.ItwLifecycleState;
  }>(
    [
      {
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET,
        expectedArgs: [ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN]
      },
      {
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO,
        expectedArgs: [ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN]
      },
      {
        lifecycle: lifecycleSelectors.ItwLifecycleState.INSTALLED,
        expectedArgs: discoveryInfo("l2")
      },
      {
        lifecycle:
          lifecycleSelectors.ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
        expectedArgs: discoveryInfo("l3")
      },
      {
        lifecycle:
          lifecycleSelectors.ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED,
        expectedArgs: discoveryInfo("l3")
      },
      {
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
        expectedArgs: discoveryInfo("l3")
      },
      {
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK,
        expectedArgs: discoveryInfo("l3")
      }
    ].map(row => ({
      ...row,
      lifecycleName: lifecycleSelectors.ItwLifecycleState[row.lifecycle]
    }))
  )(
    "navigates to the expected route when the lifecycle is $lifecycleName",
    ({ lifecycle, expectedArgs }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
        .mockReturnValue(lifecycle);

      renderComponent();

      expect(mockReplace).toHaveBeenCalledWith(...expectedArgs);
    }
  );
});

const renderComponent = (startupStatus = StartupStatusEnum.AUTHENTICATED) => {
  const stateAfterApplicationChange = appReducer(
    undefined,
    applicationChangeState("active")
  );
  const globalState = appReducer(
    stateAfterApplicationChange,
    startupLoadSuccess(startupStatus)
  );
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwDiscoveryLandingScreen,
    ITW_ROUTES.LANDING.DISCOVERY,
    {},
    store
  );
};
