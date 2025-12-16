import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as itwLifecycleSelectors from "../../../lifecycle/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as itwRemoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import { WalletCardOnboardingScreen } from "../WalletCardOnboardingScreen";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as envSelectors from "../../../common/store/selectors/environment";
import { EnvType } from "../../../common/utils/environment";

describe("WalletCardOnboardingScreen", () => {
  it("it should render the screen correctly", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    jest
      .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(true);

    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("it should render the IT Wallet modules", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    jest
      .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent();

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

  it("should not render the IT Wallet modules if ITW is not enabled", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    jest
      .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });

  it("should not render the IT Wallet modules if ITW is not in a valid state", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    jest
      .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
  });

  test.each([["mDL"], ["mDL", "EuropeanHealthInsuranceCard"]] as ReadonlyArray<
    ReadonlyArray<string>
  >)(
    "it should hide credential modules when %1 are remotely disabled",
    (...disabledCredentials) => {
      jest
        .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);

      jest
        .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(true);

      jest
        .spyOn(itwRemoteConfigSelectors, "itwDisabledCredentialsSelector")
        .mockReturnValue(disabledCredentials);

      const { queryByTestId } = renderComponent();
      for (const type of disabledCredentials!) {
        // Currently ModuleCredential does not attach the testID if onPress is undefined.
        // Since disabled credentials have undefined onPress, we can test for null.
        expect(queryByTestId(`${type}ModuleTestID`)).toBeNull();
      }
      expect(queryByTestId("EuropeanDisabilityCardModuleTestID")).toBeTruthy();
    }
  );

  test.each([
    {
      description: "renders when L3 is enabled and env is pre",
      isL3Enabled: true,
      env: "pre",
      shouldRender: true
    },
    {
      description: "renders when L3 is enabled and env is prod",
      isL3Enabled: true,
      env: "prod",
      shouldRender: true
    },
    {
      description: "does NOT render when L3 is disabled and env is pre",
      isL3Enabled: false,
      env: "pre",
      shouldRender: false
    },
    {
      description: "does NOT render when L3 is disabled and env is prod",
      isL3Enabled: false,
      env: "prod",
      shouldRender: false
    }
  ])(
    "DegreeCertificates module: $description",
    ({ isL3Enabled, env, shouldRender }) => {
      jest
        .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);

      jest
        .spyOn(itwRemoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(true);

      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(isL3Enabled);

      jest.spyOn(envSelectors, "selectItwEnv").mockReturnValue(env as EnvType);

      const { queryByTestId } = renderComponent();

      const testID = `${CredentialType.EDUCATION_DEGREE}ModuleTestID`;

      if (shouldRender) {
        expect(queryByTestId(testID)).toBeTruthy();
      } else {
        expect(queryByTestId(testID)).toBeNull();
      }
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

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
