import configureMockStore from "redux-mock-store";

import * as Mixpanel from "../../../../mixpanel";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as itwCommonSelectors from "../../../itwallet/common/store/selectors";
import { WalletEmptyScreenContent } from "../WalletEmptyScreenContent";

describe("WalletEmptyScreenContent", () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([true, false])(
    "should render correctly when ITW whitelist status is %s",
    itwEnabled => {
      jest
        .spyOn(itwCommonSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(itwEnabled);
      const component = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();
    }
  );

  it.each([
    { name: "IT-Wallet engagement", itwEnabled: true, expectedCount: 1 },
    { name: "legacy empty state", itwEnabled: false, expectedCount: 0 }
  ])(
    "tracks the discovery screen view $expectedCount times for $name",
    ({ itwEnabled, expectedCount }) => {
      jest
        .spyOn(itwCommonSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(itwEnabled);
      const track = jest.spyOn(Mixpanel, "mixpanelTrack").mockImplementation();

      renderComponent();

      const discoveryCalls = track.mock.calls.filter(
        ([event]) => event === "ITW_DISCOVERY_NEW_USER"
      );
      expect(discoveryCalls).toHaveLength(expectedCount);
      if (itwEnabled) {
        expect(track).toHaveBeenCalledWith("ITW_DISCOVERY_NEW_USER", {
          event_category: "UX",
          event_type: "screen_view",
          flow: undefined
        });
      }
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <WalletEmptyScreenContent />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
