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

describe("ItwDiscoveryBanner", () => {
  it("should correctly render the banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: true });
    expect(queryByTestId("itwDiscoveryBannerTestID")).not.toBeNull();
  });

  it("should not render the banner if ITW trial is not active", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({ isItwTrial: false });
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });
});

const renderComponent = (options: { isItwTrial: boolean }) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const { isItwTrial = false } = options;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: isItwTrial
        ? {
            [ITW_TRIAL_ID]: pot.some(SubscriptionStateEnum.ACTIVE)
          }
        : {}
    })
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
