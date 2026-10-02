import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  itwDisableItwActivation,
  itwSetL2Fallback
} from "../../store/actions/preferences";
import { ItwL2EngagementBanner } from "../ItwL2EngagementBanner";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate })
}));

describe("ItwL2EngagementBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
      .mockReturnValue(true);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);
  });

  test.each([
    {
      name: "fallback with NFC",
      fallback: true,
      disabled: false,
      expected: ITW_ROUTES.L2_ONBOARDING
    },
    {
      name: "fallback without NFC",
      fallback: true,
      disabled: true,
      expected: ITW_ROUTES.L2_ONBOARDING
    },
    {
      name: "inactive wallet without NFC",
      fallback: false,
      disabled: true,
      expected: ITW_ROUTES.L3_ONBOARDING
    }
  ])(
    "opens the correct catalogue for $name",
    ({ fallback, disabled, expected }) => {
      const state = appReducer(
        appReducer(undefined, applicationChangeState("active")),
        itwSetL2Fallback(fallback)
      );
      const { getByTestId } = renderComponent(
        disabled ? appReducer(state, itwDisableItwActivation()) : state
      );
      fireEvent.press(getByTestId("itwWalletL2BannerTestID"));

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: expected
      });
    }
  );

  it("hides the add-document banner once a document is present", () => {
    jest
      .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
      .mockReturnValue(false);
    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwWalletL2BannerTestID")).toBeNull();
  });
});

const renderComponent = (
  state = appReducer(undefined, applicationChangeState("active"))
) => {
  const store = configureMockStore<GlobalState>()(state);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwL2EngagementBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
