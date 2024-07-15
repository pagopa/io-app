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

describe("WalletCardOnboardingScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("it should render the IT Wallet modules if trial is active", () => {
    const { queryByTestId } = renderComponent({
      itwTrialStatus: SubscriptionStateEnum.ACTIVE
    });

    expect(queryByTestId("itwDrivingLicenseModuleTestID")).toBeTruthy();
    expect(queryByTestId("itwDisabilityCardModuleTestID")).toBeTruthy();
  });

  it("it should not render the IT Wallet modules if trial is not active", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwDrivingLicenseModuleTestID")).toBeFalsy();
    expect(queryByTestId("itwDisabilityCardModuleTestID")).toBeFalsy();
  });

  it("it should not render the ID Pay module if ID Pay is not active", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("idPayModuleTestID")).toBeFalsy();
  });

  it("it should render the ID Pay module if ID Pay is active", () => {
    const { queryByTestId } = renderComponent({ isIdPayEnabled: true });

    expect(queryByTestId("idPayModuleTestID")).toBeTruthy();
  });
});

const renderComponent = (
  config: {
    isIdPayEnabled?: boolean;
    itwTrialStatus?: SubscriptionState;
  } = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: {
        [ITW_TRIAL_ID as TrialId]: config.itwTrialStatus
          ? pot.some(config.itwTrialStatus)
          : pot.none
      },
      persistedPreferences: {
        isIdPayTestEnabled: config.isIdPayEnabled
      },
      backendStatus: {
        status: O.some({
          config: {
            idPay: config.isIdPayEnabled && {
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
