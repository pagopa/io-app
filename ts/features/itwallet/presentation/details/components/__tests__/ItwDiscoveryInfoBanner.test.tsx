import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { openWebUrl } from "../../../../../../utils/url";
import {
  trackItwBannerClosure,
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../../analytics";
import { itwCloseBanner } from "../../../../common/store/actions/banners";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwDiscoveryInfoBanner } from "../ItwDiscoveryInfoBanner";

jest.mock("../../../../../../utils/url", () => ({
  ...jest.requireActual("../../../../../../utils/url"),
  openWebUrl: jest.fn()
}));

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackItwBannerClosure: jest.fn(),
  trackItwBannerTap: jest.fn(),
  trackItwBannerVisualized: jest.fn()
}));

describe("ItwDiscoveryInfoBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the IT-Wallet ID discovery copy", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(
        I18n.t("features.itWallet.presentation.itWalletId.banner.title")
      )
    ).not.toBeNull();
    expect(
      getByText(
        I18n.t("features.itWallet.presentation.itWalletId.banner.content")
      )
    ).not.toBeNull();
  });

  it("tracks the banner impression on focus", () => {
    renderComponent();

    expect(trackItwBannerVisualized).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwWalletID",
        banner_page: "ITW_PRESENTATION_PID_DETAIL",
        banner_landing: expect.stringContaining("assistenza.ioapp.it")
      })
    );
  });

  it("tracks tap and opens the Help Center article", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("itwDiscoveryInfoBannerTestID"));

    expect(trackItwBannerTap).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwWalletID",
        banner_page: "ITW_PRESENTATION_PID_DETAIL",
        banner_landing: expect.stringContaining("assistenza.ioapp.it")
      })
    );
    expect(openWebUrl).toHaveBeenCalledWith(
      expect.stringContaining("assistenza.ioapp.it"),
      expect.any(Function)
    );
  });

  it("tracks close and persists the dismissal", () => {
    const { getByLabelText, store } = renderComponent();

    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));

    expect(trackItwBannerClosure).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwWalletID",
        banner_page: "ITW_PRESENTATION_PID_DETAIL",
        banner_landing: expect.stringContaining("assistenza.ioapp.it")
      })
    );
    expect(store.getActions()).toContainEqual(itwCloseBanner("itw_pid_info"));
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    ...renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryInfoBanner,
      ITW_ROUTES.PRESENTATION.PID_DETAIL,
      {},
      store
    ),
    store
  };
};
