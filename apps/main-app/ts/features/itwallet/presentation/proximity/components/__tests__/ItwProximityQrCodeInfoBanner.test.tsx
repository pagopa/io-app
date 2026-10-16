import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
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
