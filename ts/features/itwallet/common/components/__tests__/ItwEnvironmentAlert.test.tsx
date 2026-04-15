import _ from "lodash";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { EnvType } from "../../utils/environment";
import { ItwEnvironmentAlert } from "../ItwEnvironmentAlert";

describe("ItwEnvironmentAlert", () => {
  it("should render in pre environment", () => {
    const { queryByTestId } = renderComponent("pre");
    expect(queryByTestId("itwEnvironmentAlertTestID")).toBeDefined();
  });

  it("should not render in prod environment", () => {
    const { queryByTestId } = renderComponent("prod");
    expect(queryByTestId("itwEnvironmentAlertTestID")).toBeNull();
  });
});

const renderComponent = (env: EnvType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      features: {
        itWallet: {
          environment: {
            env
          }
        }
      }
    })
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwEnvironmentAlert,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
