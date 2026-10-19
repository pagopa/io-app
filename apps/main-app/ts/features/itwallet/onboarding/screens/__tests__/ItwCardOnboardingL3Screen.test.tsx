import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";

import * as appParamsList from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as envSelectors from "../../../common/store/selectors/environment";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as remoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import { EnvType } from "../../../common/utils/environment";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as catalogueSelectors from "../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { testCredentialIssuanceDeps } from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCardOnboardingL3Screen } from "../ItwCardOnboardingL3Screen";

describe("ItwCardOnboardingL3Screen", () => {
  const replaceMock = jest.fn();
  const navigateMock = jest.fn();
  const mockLifecycle = (lifecycle: lifecycleSelectors.ItwLifecycleState) =>
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
      .mockReturnValue(lifecycle);
  const restrictedTypes = [
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
  ];
  const mockL2Catalogue = () =>
    jest
      .spyOn(catalogueSelectors, "itwAvailableCredentialsListSelector")
      .mockReturnValue(
        [...restrictedTypes, CredentialType.EDUCATION_DEGREE].map(type => ({
          type,
          name: type
        }))
      );

  beforeEach(() => {
    jest.clearAllMocks();

    // default mocks
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_UPGRADABLE);
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
      .mockReturnValue(true);
    jest
      .spyOn(preferencesSelectors, "itwIsActivationDisabledSelector")
      .mockReturnValue(false);

    jest.spyOn(envSelectors, "selectItwEnv").mockReturnValue("prod" as EnvType);

    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      replace: replaceMock,
      navigate: navigateMock
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render the screen correctly (default page = 0 when params are undefined)", () => {
    const { queryByTestId } = renderComponent(undefined);

    // page=0 => ITW modules should be visible
    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
  });

  it("should render tab 1 (Other cards) when page param is 1", () => {
    const { queryByTestId } = renderComponent({ page: 1 });

    // page=1 => other section
    expect(queryByTestId("paymentsModuleTestID")).toBeTruthy();
    // and ITW modules should not be rendered in this tab
    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeNull();
  });

  it("should fallback to page 0 when page param is not a number", () => {
    const { queryByTestId } = renderComponent({ page: "abc" } as any);

    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
    expect(queryByTestId("paymentsModuleTestID")).toBeNull();
  });

  it("should render the action button when wallet is enabled", () => {
    const { queryByTestId } = renderComponent({ page: 0 });

    expect(queryByTestId("restricted-action-testID")).toBeTruthy();
  });

  it("should NOT render the action button when wallet is NOT enabled", () => {
    mockLifecycle(
      lifecycleSelectors.ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE
    );

    const { queryByText } = renderComponent({ page: 0 });

    expect(
      queryByText("features.wallet.onboarding.cta.addRestricted")
    ).toBeNull();
  });

  it("should navigate to restricted mode onboarding when action button is pressed", () => {
    const { getByTestId } = renderComponent({ page: 0 });

    const button = getByTestId("restricted-action-testID");

    fireEvent.press(button);

    expect(replaceMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.L2_ONBOARDING
    });
  });

  it("shows the upgrade banner after the three L2 documents for a missing CIE/PIN fallback", () => {
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK);
    mockL2Catalogue();
    const {
      getAllByTestId,
      getByTestId,
      getByText,
      queryByTestId,
      queryByText
    } = renderComponent({ page: 0 });

    expect(
      getAllByTestId(/ModuleTestID$|itwL2FallbackUpgradeBannerTestID/).map(
        element => element.props.testID
      )
    ).toEqual([
      ...restrictedTypes.map(type => `${type}ModuleTestID`),
      "itwL2FallbackUpgradeBannerTestID"
    ]);
    expect(
      getByText(I18n.t("features.itWallet.onboarding.fallbackBanner.title"))
    ).toBeTruthy();
    expect(
      queryByText(I18n.t("features.wallet.onboarding.no-nfc-banner.content"))
    ).toBeNull();
    expect(queryByTestId("restricted-action-testID")).toBeNull();
    fireEvent.press(getByTestId("itwL2FallbackUpgradeBannerTestID"));
    expect(navigateMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  });

  it("never shows the upgrade banner together with the NFC alert when activation is disabled", () => {
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK);
    jest
      .spyOn(preferencesSelectors, "itwIsActivationDisabledSelector")
      .mockReturnValue(true);
    mockL2Catalogue();

    const { queryByTestId, queryByText, getByText } = renderComponent({
      page: 0
    });

    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
    expect(
      queryByText(I18n.t("features.itWallet.onboarding.fallbackBanner.title"))
    ).toBeNull();
    expect(
      getByText(I18n.t("features.wallet.onboarding.no-nfc-banner.content"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("features.wallet.onboarding.no-nfc-banner.cta"))
    ).toBeTruthy();
  });

  test.each<{
    itwEnabled: boolean;
    lifecycle: lifecycleSelectors.ItwLifecycleState;
    name: string;
    page: number;
  }>([
    {
      name: "other cards tab",
      page: 1,
      itwEnabled: true,
      lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK
    },
    {
      name: "IT-Wallet disabled",
      page: 0,
      itwEnabled: false,
      lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK
    },
    {
      name: "L3 disabled",
      page: 0,
      itwEnabled: true,
      lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO
    }
  ])(
    "hides the fallback upgrade banner for $name",
    ({ page, itwEnabled, lifecycle }) => {
      mockLifecycle(lifecycle);
      jest
        .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(itwEnabled);
      const { queryByTestId } = renderComponent({ page });
      expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
    }
  );

  test.each<lifecycleSelectors.ItwLifecycleState>([
    lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK,
    lifecycleSelectors.ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED
  ])("shows only the L2 documents for %s", lifecycle => {
    mockLifecycle(lifecycle);
    mockL2Catalogue();

    const { getAllByTestId } = renderComponent({ page: 0 });

    expect(
      getAllByTestId(/ModuleTestID$/).map(element => element.props.testID)
    ).toEqual(restrictedTypes.map(type => `${type}ModuleTestID`));
  });

  it("does not show the fallback upgrade banner for a non-fallback DocIO wallet", () => {
    const { queryByTestId } = renderComponent({ page: 0 });
    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
    expect(queryByTestId("restricted-action-testID")).toBeTruthy();
  });

  it("does not offer the reduced screen for an active IT-Wallet", () => {
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET);
    const { queryByTestId } = renderComponent({ page: 0 });
    expect(queryByTestId("restricted-action-testID")).toBeNull();
  });

  it("uses the offline guard for fallback upgrade activation", () => {
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK);
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);
    const { getByTestId } = renderComponent({ page: 0 });
    fireEvent.press(getByTestId("itwL2FallbackUpgradeBannerTestID"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("issues fallback documents directly instead of restarting L3 activation", () => {
    mockLifecycle(lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_FALLBACK);
    const actor = createActor(itwCredentialIssuanceMachine, {
      input: { deps: testCredentialIssuanceDeps() }
    });
    const send = jest.spyOn(actor, "send").mockImplementation(jest.fn());
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useActorRef")
      .mockReturnValue(actor);
    const { getByTestId } = renderComponent({ page: 0 });
    fireEvent.press(
      getByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    );

    expect(send).toHaveBeenCalledWith({
      type: "select-credential",
      credentialType: CredentialType.DRIVING_LICENSE,
      mode: "issuance"
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test.each([
    {
      description: "renders DegreeCertificates when env is pre",
      env: "pre",
      shouldRender: true
    },
    {
      description: "renders DegreeCertificates when env is prod",
      env: "prod",
      shouldRender: true
    }
  ])("DegreeCertificates module: $description", ({ env, shouldRender }) => {
    jest.spyOn(envSelectors, "selectItwEnv").mockReturnValue(env as EnvType);

    const { queryByTestId } = renderComponent({ page: 0 });

    const testID = `${CredentialType.EDUCATION_DEGREE}ModuleTestID`;

    if (shouldRender) {
      expect(queryByTestId(testID)).toBeTruthy();
    } else {
      expect(queryByTestId(testID)).toBeNull();
    }
  });
});

const renderComponent = (params?: undefined | { page?: number }) => {
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
      <ItwCredentialIssuanceMachineContext.Provider
        logic={logic}
        options={{ input: { deps: testCredentialIssuanceDeps() } }}
      >
        <ItwCardOnboardingL3Screen
          navigation={{} as any}
          route={{ key: "x", name: ITW_ROUTES.L3_ONBOARDING, params } as any}
        />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.L3_ONBOARDING,
    params ?? {},
    store
  );
};
