import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as itwCommonSelectors from "../../../itwallet/common/store/selectors";
import { WalletEmptyScreenContent } from "../WalletEmptyScreenContent";

describe("WalletEmptyScreenContent", () => {
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
