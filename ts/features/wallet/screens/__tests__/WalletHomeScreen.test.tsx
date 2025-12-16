import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as walletSelectors from "../../store/selectors";
import { WalletHomeScreen } from "../WalletHomeScreen";

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: jest.fn,
  useScrollViewOffset: jest.fn,
  Layout: {
    duration: jest.fn()
  }
}));

describe("WalletHomeScreen", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  it("should not render screen actions if the wallet is empty", () => {
    jest
      .spyOn(walletSelectors, "isWalletEmptySelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent();

    jest.runOnlyPendingTimers();

    expect(queryByTestId("walletAddCardButtonTestID")).toBeNull();
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
