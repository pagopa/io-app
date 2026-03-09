import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwDiscoveryLandingScreen } from "../ItwDiscoveryLandingScreen";

const mockReplace = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ replace: mockReplace })
}));

describe("ItwDiscoveryLandingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each`
    isItWalletActive | isWalletActive | isWhitelisted | expectedRoute                                 | expectedParams
    ${true}          | ${false}       | ${false}      | ${ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN} | ${undefined}
    ${false}         | ${true}        | ${false}      | ${ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN} | ${undefined}
    ${false}         | ${false}       | ${false}      | ${ITW_ROUTES.DISCOVERY.INFO}                  | ${{ animationEnabled: false, level: "l2" }}
    ${false}         | ${false}       | ${true}       | ${ITW_ROUTES.DISCOVERY.INFO}                  | ${{ animationEnabled: false, level: "l3" }}
    ${false}         | ${true}        | ${true}       | ${ITW_ROUTES.DISCOVERY.INFO}                  | ${{ animationEnabled: false, level: "l3" }}
  `(
    "navigates to $expectedRoute when isItWalletActive=$isItWalletActive, isWalletActive=$isWalletActive, isWhitelisted=$isWhitelisted",
    ({
      isItWalletActive,
      isWalletActive,
      isWhitelisted,
      expectedRoute,
      expectedParams
    }: {
      isItWalletActive: boolean;
      isWalletActive: boolean;
      isWhitelisted: boolean;
      expectedRoute: string;
      expectedParams: object | undefined;
    }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isItWalletActive);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(isWalletActive);
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(isWhitelisted);

      renderComponent();

      if (expectedParams) {
        expect(mockReplace).toHaveBeenCalledWith(expectedRoute, expectedParams);
      } else {
        expect(mockReplace).toHaveBeenCalledWith(expectedRoute);
      }
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwDiscoveryLandingScreen,
    ITW_ROUTES.LANDING.DISCOVERY,
    {},
    store
  );
};
