import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationPidDetailScreen } from "../ItwPresentationPidDetailScreen";

const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();
const mockTrackItwStartDeactivation = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual<typeof import("@pagopa/io-app-design-system")>(
    "@pagopa/io-app-design-system"
  ),
  useIOToast: () => ({
    error: mockToastError,
    info: mockToastInfo,
    success: mockToastSuccess
  })
}));

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackItwStartDeactivation: (properties: unknown) =>
    mockTrackItwStartDeactivation(properties)
}));

describe("ItwPresentationPidDetailScreen", () => {
  beforeEach(() => {
    jest
      .spyOn(ItwEidIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: jest.fn() } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("renders the IT-Wallet ID discovery banner when it has not been dismissed", () => {
    const { queryByTestId } = renderComponent(false);

    expect(queryByTestId("itwDiscoveryInfoBannerTestID")).not.toBeNull();
  });

  it("does not render the valid lifecycle alert", () => {
    const { queryByTestId } = renderComponent(false);

    expect(queryByTestId("itwEidLifecycleAlertTestID_valid")).toBeNull();
  });

  it("does not render the IT-Wallet ID discovery banner when it has been dismissed", () => {
    const { queryByTestId } = renderComponent(true);

    expect(queryByTestId("itwDiscoveryInfoBannerTestID")).toBeNull();
  });

  it("opens the IT-Wallet deactivation dialog when online", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { getByText } = renderComponent(false);

    fireEvent.press(
      getByText(I18n.t("features.itWallet.presentation.itWalletId.cta.revoke"))
    );

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.title"),
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.message"),
      expect.any(Array)
    );
    expect(mockTrackItwStartDeactivation).toHaveBeenCalled();
  });

  it("shows an offline toast and does not open the IT-Wallet deactivation dialog when offline", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    const { getByText } = renderComponent(false, false);

    fireEvent.press(
      getByText(I18n.t("features.itWallet.presentation.itWalletId.cta.revoke"))
    );

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockTrackItwStartDeactivation).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(I18n.t("global.offline.toast"));
  });
});

const renderComponent = (isBannerHidden: boolean, isConnected = true) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const validEid = {
    ...ItwStoredCredentialsMocks.eid,
    jwt: {
      ...ItwStoredCredentialsMocks.eid.jwt,
      issuedAt: "2026-04-27T00:00:00.000Z",
      expiration: "2126-04-27T00:00:00.000Z"
    }
  };
  const state: GlobalState = {
    ...globalState,
    features: {
      ...globalState.features,
      connectivityStatus: {
        ...globalState.features.connectivityStatus,
        isConnected
      },
      itWallet: {
        ...globalState.features.itWallet,
        banners: isBannerHidden
          ? {
              itw_pid_info: {
                dismissedOn: new Date().toISOString(),
                dismissCount: 1
              }
            }
          : {},
        credentials: {
          ...globalState.features.itWallet.credentials,
          credentials: {
            [validEid.credentialId]: validEid
          }
        }
      }
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwPresentationPidDetailScreen,
    ITW_ROUTES.PRESENTATION.PID_DETAIL,
    {},
    createStore(appReducer, state as any)
  );
};
