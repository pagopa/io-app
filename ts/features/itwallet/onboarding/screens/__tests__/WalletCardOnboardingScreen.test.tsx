import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as itwLifecycleSelectors from "../../../lifecycle/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as itwRemoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import { WalletCardOnboardingScreen } from "../WalletCardOnboardingScreen";

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

  test.each([["MDL"], ["MDL", "EuropeanHealthInsuranceCard"]] as ReadonlyArray<
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
