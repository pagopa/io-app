import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import _ from "lodash";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import * as useItwDiscoveryBannerTypeModule from "../../../hooks/useItwDiscoveryBannerType";
import { ItwDiscoveryBannerLegacy } from "../ItwDiscoveryBanner";

const mockNavigate = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@pagopa/io-app-design-system"
  ),
  useIOToast: () => ({
    error: mockToastError,
    info: mockToastInfo,
    success: mockToastSuccess
  })
}));

jest.mock("../../../hooks/useItwDiscoveryBannerType.ts", () => ({
  useItwDiscoveryBannerType: jest.fn()
}));

describe("ItwDiscoveryBanner", () => {
  beforeEach(() => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("onboarding");
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should match snapshot with 'onboarding' banner type", () => {
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot with 'reactivating' banner type", () => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue("reactivating");
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should not render banner when banner type is undefined", () => {
    jest
      .spyOn(useItwDiscoveryBannerTypeModule, "useItwDiscoveryBannerType")
      .mockReturnValue(undefined);
    const { component } = renderComponent();
    const bannerElement = component.queryByTestId("itwDiscoveryBannerTestID");
    expect(bannerElement).toBeNull();
  });

  it("should show an offline toast and block navigation when the action is pressed offline", () => {
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    const { component } = renderComponent();

    fireEvent.press(component.getByTestId("itwDiscoveryBannerTestID"));

    expect(mockToastError).toHaveBeenCalledWith(I18n.t("global.offline.toast"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, globalState as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwDiscoveryBannerLegacy,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
