import configureMockStore from "redux-mock-store";
import { useHeaderFirstLevel } from "../../../../hooks/useHeaderFirstLevel";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_ADD_BUTTON
} from "../../../itwallet/tour/utils/constants";
import * as walletSelectors from "../../store/selectors";
import { WalletHomeScreen } from "../WalletHomeScreen";

jest.mock("../../../../hooks/useHeaderFirstLevel", () => ({
  useHeaderFirstLevel: jest.fn()
}));

const mockUseHeaderFirstLevel = useHeaderFirstLevel as jest.Mock;

describe("WalletHomeScreen", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render screen actions if the wallet is empty", () => {
    jest
      .spyOn(walletSelectors, "isWalletEmptySelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent();

    jest.runOnlyPendingTimers();

    expect(queryByTestId("walletAddCardButtonTestID")).toBeNull();
  });

  it("sets the IT Wallet guided tour props on the add header action", () => {
    renderComponent();

    expect(mockUseHeaderFirstLevel).toHaveBeenCalledWith(
      expect.objectContaining({
        headerProps: expect.objectContaining({
          actions: [
            expect.objectContaining({
              icon: "add",
              tourGuideProps: expect.objectContaining({
                groupId: ITW_TOUR_GROUP_ID,
                index: ITW_TOUR_STEP_ADD_BUTTON
              })
            })
          ]
        })
      })
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletHomeScreen,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
