import { fireEvent, waitFor } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as itwLifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as selectors from "../../store/selectors";
import { ItwUpgradeBanner } from "../ItwUpgradeBanner";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

describe("ItwUpgradeBanner", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([true, false])("should render %s", shouldRender => {
    jest
      .spyOn(selectors, "itwShouldRenderL3UpgradeBannerSelector")
      .mockReturnValue(shouldRender);

    const { getByTestId } = renderComponent();

    if (shouldRender) {
      expect(getByTestId("itwUpgradeBannerTestID")).toBeDefined();
    } else {
      expect(() => getByTestId("itwUpgradeBannerTestID")).toThrow();
    }
  });

  it("should navigate to the Discovery Info Screen", async () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(selectors, "itwShouldRenderL3UpgradeBannerSelector")
      .mockReturnValue(true);

    const { getAllByText } = renderComponent();
    const [button] = getAllByText(
      I18n.t("features.itWallet.upgrade.banner.documents.active.action")
    );
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { level: "l3" }
      });
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwUpgradeBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
