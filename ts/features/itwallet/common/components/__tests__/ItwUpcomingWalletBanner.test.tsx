import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../../definitions/content/Config";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwUpcomingWalletBanner } from "../ItwUpcomingWalletBanner";

type RenderOptions = {
  isItwEnabled?: boolean;
};

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwUpcomingWalletBanner", () => {
  it.each([
    [true, true],
    [false, true]
  ])(
    "If ITW is %s the rendering of the banner should be %s",
    (isItwEnabled, shouldRender) => {
      const { component } = renderComponent({ isItwEnabled });
      const banner = component.queryByTestId("itwUpcomingWalletBannerTestID");
      if (shouldRender) {
        expect(banner).not.toBeNull();
      } else {
        expect(banner).toBeNull();
      }
    }
  );
});

const renderComponent = ({ isItwEnabled = true }: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      remoteConfig: O.some({
        itw: {
          enabled: isItwEnabled,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        },
        assistanceTool: { tool: ToolEnum.none },
        cgn: { enabled: true },
        newPaymentSection: {
          enabled: false,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        },
        fims: { enabled: true }
      } as Config)
    } as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwUpcomingWalletBanner,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
