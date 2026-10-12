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
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwDiscoveryInfoBanner } from "../ItwDiscoveryInfoBanner";

const showcaseUrl = "https://example.com/it-wallet";
const mockToastInfo = jest.fn();
const mockToastError = jest.fn();

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
  ),
  useIOToast: () => ({
    info: mockToastInfo,
    error: mockToastError
  })
}));

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
    jest
      .spyOn(remoteConfigSelectors, "itwShowcaseUrlSelector")
      .mockReturnValue(showcaseUrl);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
        banner_landing: showcaseUrl
      })
    );
  });

  it("tracks tap and opens the configured showcase URL", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("itwDiscoveryInfoBannerTestID"));

    expect(trackItwBannerTap).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwWalletID",
        banner_page: "ITW_PRESENTATION_PID_DETAIL",
        banner_landing: showcaseUrl
      })
    );
    expect(openWebUrl).toHaveBeenCalledWith(showcaseUrl, expect.any(Function));
  });

  it("tracks close and persists the dismissal", () => {
    const { getByLabelText, store } = renderComponent();

    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));

    expect(trackItwBannerClosure).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwWalletID",
        banner_page: "ITW_PRESENTATION_PID_DETAIL",
        banner_landing: showcaseUrl
      })
    );
    expect(store.getActions()).toContainEqual(itwCloseBanner("itw_pid_info"));
  });

  it("shows an error toast when opening the showcase URL fails", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("itwDiscoveryInfoBannerTestID"));

    const [, onError] = jest.mocked(openWebUrl).mock.calls[0];
    onError?.();

    expect(mockToastError).toHaveBeenCalledWith(I18n.t("global.jserror.title"));
  });

  it("shows an info toast without opening a URL or tracking when the showcase URL is missing", () => {
    jest
      .mocked(remoteConfigSelectors.itwShowcaseUrlSelector)
      .mockReturnValue(undefined);
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("itwDiscoveryInfoBannerTestID"));

    expect(mockToastInfo).toHaveBeenCalledWith(
      I18n.t("features.itWallet.generic.featureUnavailable.title")
    );
    expect(openWebUrl).not.toHaveBeenCalled();
    expect(trackItwBannerVisualized).not.toHaveBeenCalled();
    expect(trackItwBannerTap).not.toHaveBeenCalled();
  });

  it("persists dismissal without tracking when the showcase URL is missing", () => {
    jest
      .mocked(remoteConfigSelectors.itwShowcaseUrlSelector)
      .mockReturnValue(undefined);
    const { getByLabelText, store } = renderComponent();

    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));

    expect(trackItwBannerClosure).not.toHaveBeenCalled();
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
