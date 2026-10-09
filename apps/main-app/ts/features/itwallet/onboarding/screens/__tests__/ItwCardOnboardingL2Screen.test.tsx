import { act, fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwSetL2Fallback } from "../../../common/store/actions/preferences";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as credentialsSelectors from "../../../credentials/store/selectors/index";
import * as catalogueSelectors from "../../../credentialsCatalogue/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { testCredentialIssuanceDeps } from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCardOnboardingL2Screen } from "../ItwCardOnboardingL2Screen";

const mockReplace = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      ...actual.useNavigation(),
      replace: mockReplace
    })
  };
});

describe("ItwCardOnboardingL2Screen", () => {
  const mockSelectorResult = {
    obtained: [],
    notObtained: [
      { type: CredentialType.DRIVING_LICENSE, name: "Patente di guida" }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();

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

  it("does not show the fallback upgrade banner on the reduced screen", () => {
    const state = appReducer(
      appReducer(undefined, applicationChangeState("active")),
      itwSetL2Fallback(true)
    );

    const { queryByTestId } = renderComponent(state);
    expect(queryByTestId("itwL2FallbackUpgradeBannerTestID")).toBeNull();
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

    expect(mockReplace).toHaveBeenCalledWith(ITW_ROUTES.L3_ONBOARDING, {
      page: 1
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
