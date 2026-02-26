import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";

import * as envSelectors from "../../../common/store/selectors/environment";
import { EnvType } from "../../../common/utils/environment";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";

import * as appParamsList from "../../../../../navigation/params/AppParamsList";
import { ItwCardOnboardingScreen } from "../ItwCardOnboardingScreen";

describe("ItwCardOnboardingScreen", () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // default mocks
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    jest.spyOn(envSelectors, "selectItwEnv").mockReturnValue("prod" as EnvType);

    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      replace: replaceMock
    } as any);
  });

  it("it should render the screen correctly (default page = 0 when params are undefined)", () => {
    const { queryByTestId } = renderComponent(undefined);

    // page=0 => ITW modules should be visible
    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
  });

  it("it should render tab 1 (Other cards) when page param is 1", () => {
    const { queryByTestId } = renderComponent({ page: 1 });

    // page=1 => other section
    expect(queryByTestId("paymentsModuleTestID")).toBeTruthy();
    // and ITW modules should not be rendered in this tab
    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeNull();
  });

  it("it should fallback to page 0 when page param is not a number", () => {
    const { queryByTestId } = renderComponent({ page: "1" } as any);

    expect(
      queryByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
    expect(queryByTestId("paymentsModuleTestID")).toBeNull();
  });

  it("it should render the action button when wallet is enabled", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent({ page: 0 });

    expect(queryByTestId("restricted-action-testID")).toBeTruthy();
  });

  it("it should NOT render the action button when wallet is NOT enabled", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    const { queryByText } = renderComponent({ page: 0 });

    expect(
      queryByText("features.itWallet.onboarding.cta.addRestricted")
    ).toBeNull();
  });

  it("it should navigate to restricted mode onboarding when action button is pressed", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    const { getByTestId } = renderComponent({ page: 0 });

    const button = getByTestId("restricted-action-testID");

    fireEvent.press(button);

    expect(replaceMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.RESTRICTED_MODE_ONBOARDING
    });
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

const renderComponent = (params?: { page?: number } | undefined) => {
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
        <ItwCardOnboardingScreen
          route={{ key: "x", name: ITW_ROUTES.L3_ONBOARDING, params } as any}
          navigation={{} as any}
        />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.L3_ONBOARDING,
    params ?? {},
    store
  );
};
