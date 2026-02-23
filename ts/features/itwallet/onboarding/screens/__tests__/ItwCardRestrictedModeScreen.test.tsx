import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";

import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCardRestrictedModeScreen } from "../ItwCardRestrictedModeScreen";

import * as credentialsSelectors from "../../../credentials/store/selectors/index";

import * as appParamsList from "../../../../../navigation/params/AppParamsList";

import { CredentialType } from "../../../common/utils/itwMocksUtils";

describe("ItwCardRestrictedModeScreen", () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      replace: replaceMock
    } as any);

    jest
      .spyOn(credentialsSelectors, "itwCredentialsSplittedSelector")
      .mockReturnValue({
        obtained: [],
        notObtained: [CredentialType.DRIVING_LICENSE]
      } as any);
  });

  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("it should render the restricted mode section", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("restricted-mode-section-testID")).toBeTruthy();
  });

  it("it should render restricted credentials modules", () => {
    const { getByTestId } = renderComponent();

    expect(
      getByTestId(`${CredentialType.DRIVING_LICENSE}ModuleTestID`)
    ).toBeTruthy();
  });

  it("it should navigate to L3 onboarding page=1 when add bonus button is pressed", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("add-bonus-action-testID"));

    expect(replaceMock).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.L3_ONBOARDING,
      params: { page: 1 }
    });
  });
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
        <ItwCardRestrictedModeScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.RESTRICTED_MODE_ONBOARDING,
    {},
    store
  );
};
