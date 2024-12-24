import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../../definitions/content/Config";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { RemoteConfigState } from "../../../../../store/reducers/backendStatus/remoteConfig";
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
  isItwEnabled?: boolean;
  isItwTestEnabled?: boolean;
  itwLifecycle?: ItwLifecycleState;
  remotelyDisabledCredentials?: Array<string>;
};

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
      queryByTestId(
        `${CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD}ModuleTestID`
      )
    ).toBeTruthy();
    expect(
      queryByTestId(`${CredentialType.EUROPEAN_DISABILITY_CARD}ModuleTestID`)
    ).toBeTruthy();
  });

  test.each([
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

  test.each([
    { remotelyDisabledCredentials: ["MDL"] },
    { remotelyDisabledCredentials: ["MDL", "EuropeanHealthInsuranceCard"] }
  ] as ReadonlyArray<RenderOptions>)(
    "it should hide credential modules when $remotelyDisabledCredentials are remotely disabled",
    options => {
      const { queryByTestId } = renderComponent(options);
      for (const type of options.remotelyDisabledCredentials!) {
        // Currently ModuleCredential does not attach the testID if onPress is undefined.
        // Since disabled credentials have undefined onPress, we can test for null.
        expect(queryByTestId(`${type}ModuleTestID`)).toBeNull();
      }
      expect(queryByTestId("EuropeanDisabilityCardModuleTestID")).toBeTruthy();
    }
  );
});

const renderComponent = ({
  isIdPayEnabled = true,
  isItwEnabled = true,
  itwLifecycle = ItwLifecycleState.ITW_LIFECYCLE_VALID,
  remotelyDisabledCredentials
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
      persistedPreferences: {
        isIdPayTestEnabled: isIdPayEnabled
      },
      remoteConfig: O.some({
        itw: {
          enabled: isItwEnabled,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          },
          disabled_credentials: remotelyDisabledCredentials
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
      } as Config) as RemoteConfigState
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
