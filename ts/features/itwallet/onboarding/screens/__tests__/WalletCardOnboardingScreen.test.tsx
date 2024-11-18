import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../../definitions/content/Config";
import {
  SubscriptionState,
  SubscriptionStateEnum
} from "../../../../../../definitions/trial_system/SubscriptionState";
import { TrialId } from "../../../../../../definitions/trial_system/TrialId";
import { itwTrialId } from "../../../../../config";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { BackendStatusState } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { WalletCardOnboardingScreen } from "../WalletCardOnboardingScreen";

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

    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
    expect(
      queryByTestId(`${CredentialType.EUROPEAN_DISABILITY_CARD}ModuleTestID`)
    ).toBeTruthy();
  });

  test.each([
    { itwTrialStatus: SubscriptionStateEnum.DISABLED },
    { isItwEnabled: false },
    { itwLifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED },
    { itwLifecycle: ItwLifecycleState.ITW_LIFECYCLE_DEACTIVATED }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render the IT Wallet modules if %p",
    options => {
      const { queryByTestId } = renderComponent(options);
      expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
    }
  );
});

const renderComponent = ({
  isIdPayEnabled = true,
  isItwEnabled = true,
  itwTrialStatus = SubscriptionStateEnum.ACTIVE,
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
        [itwTrialId as TrialId]: itwTrialStatus
          ? pot.some(itwTrialStatus)
          : pot.none
      },
      persistedPreferences: {
        isIdPayTestEnabled: isIdPayEnabled
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
  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider logic={logic}>
        <WalletCardOnboardingScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    store
  );
};
