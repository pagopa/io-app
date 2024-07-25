import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../../definitions/content/Config";
import {
  SubscriptionState,
  SubscriptionStateEnum
} from "../../../../../../definitions/trial_system/SubscriptionState";
import { TrialId } from "../../../../../../definitions/trial_system/TrialId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { BackendStatusState } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_TRIAL_ID } from "../../../common/utils/itwTrialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { WalletCardOnboardingScreen } from "../WalletCardOnboardingScreen";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";

type RenderOptions = {
  isIdPayEnabled?: boolean;
  itwTrialStatus?: SubscriptionState;
  isItwEnabled?: boolean;
  isItwTestEnabled?: boolean;
  itwLifecycle?: ItwLifecycleState;
};

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("WalletCardOnboardingScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent({});
    expect(component).toBeTruthy();
  });

  it("it should render the IT Wallet modules", () => {
    const { queryByTestId } = renderComponent({});

    expect(queryByTestId("itwDrivingLicenseModuleTestID")).toBeTruthy();
  });

  test.each([
    { itwTrialStatus: SubscriptionStateEnum.DISABLED },
    { isItwEnabled: false },
    { isItwTestEnabled: false },
    { itwLifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED },
    { itwLifecycle: ItwLifecycleState.ITW_LIFECYCLE_DEACTIVATED }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render the IT Wallet modules if %p",
    options => {
      const { queryByTestId } = renderComponent(options);
      expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
    }
  );

  it("it should not render the ID Pay module if ID Pay is not active", () => {
    const { queryByTestId } = renderComponent({ isIdPayEnabled: false });

    expect(queryByTestId("idPayModuleTestID")).toBeFalsy();
  });

  it("it should render the ID Pay module if ID Pay is active", () => {
    const { queryByTestId } = renderComponent({ isIdPayEnabled: true });

    expect(queryByTestId("idPayModuleTestID")).toBeTruthy();
  });
});

const renderComponent = ({
  isIdPayEnabled = true,
  isItwEnabled = true,
  itwTrialStatus = SubscriptionStateEnum.ACTIVE,
  isItwTestEnabled = true,
  itwLifecycle = ItwLifecycleState.ITW_LIFECYCLE_VALID
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      features: {
        itWallet: {
          lifecycle: itwLifecycle,
          ...(itwLifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID && {
            credentials: { eid: O.some({}) },
            issuance: { integrityKeyTag: O.some("key-tag") }
          })
        }
      },
      trialSystem: {
        [ITW_TRIAL_ID as TrialId]: itwTrialStatus
          ? pot.some(itwTrialStatus)
          : pot.none
      },
      persistedPreferences: {
        isIdPayTestEnabled: isIdPayEnabled,
        isItWalletTestEnabled: isItwTestEnabled
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
            idPay: isIdPayEnabled && {
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

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider>
        <WalletCardOnboardingScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    store
  );
};
