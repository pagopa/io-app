import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as analytics from "../../../analytics";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import * as credentials from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwSettingsScreen } from "../ItwSettingsScreen";

const mockNavigate = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({ navigate: mockNavigate })
}));

describe("ItwSettingsScreen", () => {
  const spyUseActorRef = jest.spyOn(
    ItwEidIssuanceMachineContext,
    "useActorRef"
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // By default, wallet invalid and no simplified activation
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    // Mock actor ref
    spyUseActorRef.mockReturnValue({ send: jest.fn() } as any);
    // Ensure Alert.alert is a spy
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

    // Spy analytics tracker
    jest
      .spyOn(analytics, "trackWalletStartDeactivation")
      .mockImplementation(jest.fn());
  });

  const renderComponent = () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    return renderScreenWithNavigationStoreContext(
      ItwSettingsScreen,
      ITW_ROUTES.SETTINGS,
      {},
      store
    );
  };

  it("shows Obtain CTA and navigates to discovery when wallet is not active", () => {
    const { getByTestId, queryByTestId } = renderComponent();

    expect(getByTestId("itwObtainButtonTestID")).toBeTruthy();
    expect(queryByTestId("itwRevokeButtonTestID")).toBeNull();
    expect(queryByTestId("ItwEidLifecycleAlertMock")).toBeNull();

    fireEvent.press(getByTestId("itwObtainButtonTestID"));
    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  });

  it("shows Revoke CTA, opens alert and confirms sends revoke event when wallet is valid", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentials, "itwCredentialsEidSelector")
      .mockReturnValue(O.some(ItwStoredCredentialsMocks.eid));
    jest
      .spyOn(credentials, "itwCredentialsEidStatusSelector")
      .mockReturnValue("valid");

    const { getByTestId, queryByTestId } = renderComponent();

    expect(getByTestId("itwRevokeButtonTestID")).toBeTruthy();
    expect(queryByTestId("itwObtainButtonTestID")).toBeNull();
    expect(getByTestId("itwEidLifecycleAlertTestID_valid")).toBeTruthy();

    fireEvent.press(getByTestId("itwRevokeButtonTestID"));
    expect(analytics.trackWalletStartDeactivation).toHaveBeenCalledWith(
      "ITW_PID"
    );

    expect(Alert.alert).toHaveBeenCalled();

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertArgs[2] as Array<any>;
    const confirmBtn = buttons.find(
      b =>
        b.text ===
        I18n.t(
          "features.itWallet.presentation.itWalletId.dialog.revoke.confirm"
        )
    );
    expect(confirmBtn).toBeDefined();
    // Trigger confirm
    confirmBtn.onPress();

    const actorRefValue = spyUseActorRef.mock.results[0].value as {
      send: jest.Mock;
    };
    expect(actorRefValue.send).toHaveBeenCalledWith({
      type: "revoke-wallet-instance"
    });
  });
});
