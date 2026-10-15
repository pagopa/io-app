import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as alertTracking from "../../hooks/useItwEidLifecycleAlertTracking";
import { ItwStoredCredentialsMocks } from "../../utils/itwMocksUtils";
import { ItwEidLifecycleAlert } from "../ItwEidLifecycleAlert";

const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn(() => jest.fn())
} as any;

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => mockNavigation
}));

describe("ItwEidLifecycleAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not crash when rendered outside a navigation context without currentScreenName", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(ItwStoredCredentialsMocks.eid);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    expect(() => renderComponent()).not.toThrow();
  });

  it("should forward currentScreenName to the tracking hook", () => {
    const expectedRoute = "ITW_PRESENTATION_EID_DETAIL";
    const trackingSpy = jest.spyOn(
      alertTracking,
      "useItwEidLifecycleAlertTracking"
    );

    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(ItwStoredCredentialsMocks.eid);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    renderComponent({ currentScreenName: expectedRoute });

    expect(trackingSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        currentScreenName: expectedRoute,
        isItwCredential: true
      })
    );
  });

  it("should render the alert when eID status is included in lifecycleStatus", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(ItwStoredCredentialsMocks.eid);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwEidLifecycleAlertTestID")).not.toBeNull();
  });

  it("should not render the alert when eID option is none", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwEidLifecycleAlertTestID")).toBeNull();
  });

  it("should not render the alert when eID status is not in lifecycleStatus", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(ItwStoredCredentialsMocks.eid);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("valid");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent({
      lifecycleStatus: ["jwtExpiring"]
    });

    expect(queryByTestId("itwEidLifecycleAlertTestID")).toBeNull();
  });

  describe("when the eID is invalid", () => {
    beforeEach(() => {
      jest
        .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
        .mockReturnValue(ItwStoredCredentialsMocks.eid);
      jest
        .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
        .mockReturnValue("invalid");
    });

    test.each([
      {
        name: "PID detail screen",
        currentScreenName: ITW_ROUTES.PRESENTATION.PID_DETAIL,
        action: "Scopri di più"
      },
      {
        name: "wallet screen",
        currentScreenName: "WALLET_HOME",
        action: "Rivedi i dati"
      }
    ])(
      "should render the invalid alert on the $name",
      ({ currentScreenName, action }) => {
        jest
          .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
          .mockReturnValue(true);

        const { getByTestId, getByText } = renderComponent({
          currentScreenName,
          lifecycleStatus: ["invalid"]
        });

        expect(getByTestId("itwEidLifecycleAlertTestID_invalid")).toBeTruthy();
        expect(getByText(action)).toBeTruthy();
      }
    );

    it("should start the eID reissuance from the bottom sheet", () => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(true);

      const { getByTestId } = renderComponent({
        lifecycleStatus: ["invalid"]
      });
      fireEvent.press(
        getByTestId("itwEidInvalidBottomSheetUpdateButtonTestID")
      );

      expect(mockNavigation.navigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
        params: { eidReissuing: true, level: "l3" }
      });
    });

    it("should not render the alert for Documenti su IO", () => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(false);

      const { queryByTestId } = renderComponent({
        lifecycleStatus: ["invalid"]
      });

      expect(queryByTestId("itwEidLifecycleAlertTestID")).toBeNull();
    });
  });
});

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 }
};

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ItwEidLifecycleAlert>> = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <Provider store={store}>
        <ItwEidLifecycleAlert navigation={mockNavigation} {...props} />
      </Provider>
    </SafeAreaProvider>
  );
};
