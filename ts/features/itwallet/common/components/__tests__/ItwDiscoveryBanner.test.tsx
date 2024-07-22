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
import { BackendStatusState } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";
import { ITW_TRIAL_ID } from "../../utils/itwTrialUtils";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";

type RenderOptions = {
  isItwTrial?: boolean;
  isItwValid?: boolean;
  isItwEnabled?: boolean;
};

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwDiscoveryBanner", () => {
  it("should render the banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({});
    expect(queryByTestId("itwDiscoveryBannerTestID")).not.toBeNull();
  });

  test.each([
    { isItwTrial: false },
    { isItwEnabled: false },
    { isItwValid: true }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render the banner if %p",
    options => {
      const {
        component: { queryByTestId }
      } = renderComponent(options);
      expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
    }
  );
});

const renderComponent = ({
  isItwEnabled = true,
  isItwTrial = true,
  isItwValid = false
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: isItwTrial
        ? {
            [ITW_TRIAL_ID]: pot.some(SubscriptionStateEnum.ACTIVE)
          }
        : {},
      features: {
        itWallet: isItwValid
          ? {
              lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
              issuance: { integrityKeyTag: O.some("key-tag") },
              credentials: { eid: O.some({}) }
            }
          : {
              lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
            }
      },
      backendStatus: {
        status: O.some({
          config: {
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
          } as Config
        } as BackendStatus)
      } as BackendStatusState
    } as GlobalState)
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
