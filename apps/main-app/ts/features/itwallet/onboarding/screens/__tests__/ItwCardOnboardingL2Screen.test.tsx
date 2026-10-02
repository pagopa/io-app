import { act, fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import * as appParamsList from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import { itwSetL2Fallback } from "../../../common/store/actions/preferences";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as remoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as credentialsSelectors from "../../../credentials/store/selectors/index";
import * as catalogueSelectors from "../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { testCredentialIssuanceDeps } from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCardOnboardingL2Screen } from "../ItwCardOnboardingL2Screen";

describe("ItwCardOnboardingL2Screen", () => {
  const replaceMock = jest.fn();
  const navigateMock = jest.fn();

  const mockSelectorResult = {
    obtained: [],
    notObtained: [
      { type: CredentialType.DRIVING_LICENSE, name: "Patente di guida" }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      replace: replaceMock,
      navigate: navigateMock
    } as any);

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(preferencesSelectors, "itwIsFiscalCodeWhitelisted")
      .mockReturnValue(true);
    jest
      .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(true);
    jest
      .spyOn(remoteConfigSelectors, "isItwMinAppVersionSupportedSelector")
      .mockReturnValue(false);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    jest
      .spyOn(credentialsSelectors, "makeItwCredentialsByPresenceSelector")
      .mockReturnValue((() => mockSelectorResult) as any);
  });

  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("should render the restricted mode section", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("restricted-mode-section-testID")).toBeTruthy();
  });

  it("should render restricted credentials modules", () => {
    const { getByTestId } = renderComponent();

    expect(
      getByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
  });

  it("offers IT-Wallet activation in the fallback catalogue", () => {
    const state = appReducer(
      appReducer(undefined, applicationChangeState("active")),
      itwSetL2Fallback(true)
    );

    const { getByTestId, getByText } = renderComponent(state);

    expect(
      getByText(
        I18n.t("features.itWallet.onboarding.restrictedMode.banner.title")
      )
    ).toBeTruthy();
    fireEvent.press(getByTestId("itwL2FallbackUpgradeBannerTestID"));
    expect(navigateMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  });

  it("does not offer IT-Wallet activation without a fallback activation", () => {
    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
  });

  it("does not offer IT-Wallet activation when L3 is disabled", () => {
    jest
      .spyOn(preferencesSelectors, "itwIsFiscalCodeWhitelisted")
      .mockReturnValue(false);
    const state = appReducer(
      appReducer(undefined, applicationChangeState("active")),
      itwSetL2Fallback(true)
    );

    const { queryByTestId } = renderComponent(state);
    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
  });

  it("does not offer IT-Wallet activation when the feature is disabled", () => {
    jest
      .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(false);
    const state = appReducer(
      appReducer(undefined, applicationChangeState("active")),
      itwSetL2Fallback(true)
    );

    const { queryByTestId } = renderComponent(state);
    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
  });

  it("does not start IT-Wallet activation offline", () => {
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);
    const state = appReducer(
      appReducer(undefined, applicationChangeState("active")),
      itwSetL2Fallback(true)
    );

    const { getByTestId } = renderComponent(state);
    fireEvent.press(getByTestId("itwL2FallbackUpgradeBannerTestID"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows only the three restricted documents from the full catalogue", () => {
    jest
      .spyOn(credentialsSelectors, "makeItwCredentialsByPresenceSelector")
      .mockRestore();
    const restrictedTypes = [
      CredentialType.DRIVING_LICENSE,
      CredentialType.EUROPEAN_DISABILITY_CARD,
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
    ];
    jest
      .spyOn(catalogueSelectors, "itwAvailableCredentialsListSelector")
      .mockReturnValue(
        [...restrictedTypes, CredentialType.EDUCATION_DEGREE].map(type => ({
          type,
          name: type
        }))
      );

    const { getByTestId, queryByTestId } = renderComponent();
    restrictedTypes.forEach(type => {
      expect(getByTestId(`${type}ModuleTestID`)).toBeTruthy();
    });
    expect(
      queryByTestId(`${CredentialType.EDUCATION_DEGREE}ModuleTestID`)
    ).toBeNull();
  });

  it("should navigate to L3 onboarding page=1 when add bonus button is pressed", () => {
    const { getByTestId } = renderComponent();

    act(() => {
      fireEvent.press(getByTestId("add-bonus-action-testID"));
    });

    expect(replaceMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.L3_ONBOARDING,
      params: { page: 1 }
    });
  });
});

const renderComponent = (
  globalState = appReducer(undefined, applicationChangeState("active"))
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider
        logic={logic}
        options={{ input: { deps: testCredentialIssuanceDeps() } }}
      >
        <ItwCardOnboardingL2Screen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.L2_ONBOARDING,
    {},
    store
  );
};
