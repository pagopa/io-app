import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { TourProvider } from "../../../../tour/components/TourProvider";
import { walletAddCards } from "../../../../wallet/store/actions/cards";
import * as commonSelectors from "../../../common/store/selectors";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as itwGuidedTour from "../../../tour/hooks/useItwGuidedTour";
import { ItwWalletCardsContainer } from "../ItwWalletCardsContainer";

const mockNavigate = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({ navigate: mockNavigate })
}));

const renderContainer = () => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  return renderScreenWithNavigationStoreContext(
    () => (
      <TourProvider>
        <ItwWalletCardsContainer />
      </TourProvider>
    ),
    ROUTES.WALLET_HOME,
    {},
    store
  );
};

describe("ItwWalletCardsContainer", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should not re-render when only cards of other categories change", () => {
    const store = createStore(
      appReducer,
      appReducer(undefined, applicationChangeState("active")) as any
    );
    store.dispatch(
      walletAddCards([
        {
          key: "ITW_mDL",
          category: "itw",
          type: "itw",
          credentialType: CredentialType.DRIVING_LICENSE,
          credentialStatus: "valid"
        }
      ])
    );
    // The hook runs on every render of the container
    const renderSpy = jest.spyOn(itwGuidedTour, "useItwGuidedTour");

    renderScreenWithNavigationStoreContext(
      () => (
        <TourProvider>
          <ItwWalletCardsContainer />
        </TourProvider>
      ),
      ROUTES.WALLET_HOME,
      {},
      store
    );
    renderSpy.mockClear();

    act(() => {
      store.dispatch(
        walletAddCards([
          { key: "1", category: "payment", type: "payment", walletId: "1" }
        ])
      );
    });

    expect(renderSpy).not.toHaveBeenCalled();
  });

  it("should open the L3 credentials catalog from the IT-Wallet header add button", () => {
    jest
      .spyOn(commonSelectors, "itwShouldRenderNewItWalletSelector")
      .mockReturnValue(true);

    const { getByTestId } = renderContainer();
    fireEvent.press(getByTestId("walletCardsCategoryItwAddButtonTestID"));

    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.L3_ONBOARDING
    });
  });

  it("should not render the add button without IT-Wallet", () => {
    jest
      .spyOn(commonSelectors, "itwShouldRenderNewItWalletSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderContainer();

    expect(queryByTestId("walletCardsCategoryItwAddButtonTestID")).toBeNull();
  });
});
