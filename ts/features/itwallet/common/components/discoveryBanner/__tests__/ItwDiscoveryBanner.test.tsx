import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../../../definitions/content/Config";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { RemoteConfigState } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwLifecycleState } from "../../../../lifecycle/store/reducers";
import { ItwDiscoveryBanner } from "../ItwDiscoveryBanner";
import { ItwDiscoveryBannerStandalone } from "../ItwDiscoveryBannerStandalone";

type RenderOptions = {
  isItwValid?: boolean;
  isItwEnabled?: boolean;
};

describe("ItwDiscoveryBanner", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwDiscoveryBanner />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
  it("should match snapshot", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("ItwDiscoveryBannerStandalone", () => {
  it("should render the banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({});
    expect(queryByTestId("itwDiscoveryBannerTestID")).not.toBeNull();
  });

  it("should match snapshot", () => {
    const { component } = renderComponent({});
    expect(component.toJSON()).toMatchSnapshot();
  });

  test.each([
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
  isItwValid = false
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
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
      } as Config) as RemoteConfigState
    } as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBannerStandalone,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
