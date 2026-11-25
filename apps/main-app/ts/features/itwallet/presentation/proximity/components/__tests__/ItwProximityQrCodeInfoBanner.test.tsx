import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as urlUtils from "../../../../../../utils/url";
import { trackItwBannerVisualized } from "../../../../analytics";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { ItwProximityQrCodeInfoBanner } from "../ItwProximityQrCodeInfoBanner";

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackItwBannerVisualized: jest.fn(),
  trackItwBannerTap: jest.fn(),
  trackItwBannerClosure: jest.fn()
}));

describe("ItwProximityQrCodeInfoBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot", () => {
    expect(renderComponent().toJSON()).toMatchSnapshot();
  });

  it("tracks the banner impression on focus with the expected properties", () => {
    renderComponent();
    expect(trackItwBannerVisualized).toHaveBeenCalledWith(
      expect.objectContaining({
        banner_id: "itwQrCodeInfos",
        banner_page: "ITW_QR_CODE",
        banner_landing: expect.stringContaining("assistenza.ioapp.it")
      })
    );
  });

  it("opens the IT-Wallet verification help article when pressing the action", () => {
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(jest.fn());
    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(
        I18n.t(
          "features.itWallet.presentation.proximity.engagement.banner.action"
        )
      )
    );

    expect(openWebUrlSpy).toHaveBeenCalledWith(
      "https://assistenza.ioapp.it/hc/it/articles/50616347827473-Come-funziona-la-verifica-dei-documenti-digitali-IT-Wallet",
      expect.any(Function)
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwProximityQrCodeInfoBanner,
    ITW_PROXIMITY_ROUTES.PRESENTMENT,
    {},
    store
  );
};
