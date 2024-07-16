import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";
import ROUTES from "../../../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SubscriptionStateEnum } from "../../../../../../definitions/trial_system/SubscriptionState";
import { ITW_TRIAL_ID } from "../../utils/itwTrialUtils";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";

describe("ItwDiscoveryBanner", () => {
  it("should render the banner if trial is ON and wallet is not VALID", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: true, isItwValid: false });
    expect(queryByTestId("itwDiscoveryBannerTestID")).not.toBeNull();
  });

  it("should not render the banner if trial OFF and wallet is not VALID", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: false, isItwValid: false });
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });

  it("should not render the banner if trial OFF and wallet is VALID", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: false, isItwValid: true });
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });

  it("should not render the banner if trial ON and wallet is VALID", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: true, isItwValid: true });
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });
});

const renderComponent = (options: {
  isItwTrial: boolean;
  isItwValid: boolean;
}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const { isItwTrial = false, isItwValid = false } = options;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: isItwTrial
        ? {
            [ITW_TRIAL_ID]: pot.some(SubscriptionStateEnum.ACTIVE)
          }
        : {},
      features: {
        itWallet: {
          lifecycle: isItwValid
            ? ItwLifecycleState.ITW_LIFECYCLE_VALID
            : ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
        }
      }
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
