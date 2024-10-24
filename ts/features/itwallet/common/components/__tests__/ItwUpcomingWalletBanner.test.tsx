import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../../definitions/content/Config";
import { SubscriptionStateEnum } from "../../../../../../definitions/trial_system/SubscriptionState";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwTrialId } from "../../../../../config";
import { ItwUpcomingWalletBanner } from "../ItwUpcomingWalletBanner";

type RenderOptions = {
  isItwEnabled?: boolean;
  itwTrialStatus?: SubscriptionStateEnum;
};

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwUpcomingWalletBanner", () => {
  it.each([
    [true, SubscriptionStateEnum.UNSUBSCRIBED, true],
    [true, SubscriptionStateEnum.SUBSCRIBED, true],
    [true, SubscriptionStateEnum.DISABLED, true],
    [true, SubscriptionStateEnum.ACTIVE, false],
    [false, SubscriptionStateEnum.UNSUBSCRIBED, true],
    [false, SubscriptionStateEnum.SUBSCRIBED, true],
    [false, SubscriptionStateEnum.DISABLED, true],
    [false, SubscriptionStateEnum.ACTIVE, false]
  ])(
    "If ITW is %s and the trial status is %s, the rendering of the banner should be %s",
    (isItwEnabled, itwTrialStatus, shouldRender) => {
      const { component } = renderComponent({ isItwEnabled, itwTrialStatus });
      const banner = component.queryByTestId("itwUpcomingWalletBannerTestID");
      if (shouldRender) {
        expect(banner).not.toBeNull();
      } else {
        expect(banner).toBeNull();
      }
    }
  );
});

const renderComponent = ({
  isItwEnabled = true,
  itwTrialStatus = SubscriptionStateEnum.ACTIVE
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: {
        [itwTrialId]: pot.some(itwTrialStatus)
      },
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
