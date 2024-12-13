import _ from "lodash";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";

describe("ItwDiscoveryBanner", () => {
  it("should match snapshot", () => {
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, globalState as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBanner,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
