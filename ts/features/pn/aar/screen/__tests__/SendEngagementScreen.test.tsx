import { createStore } from "redux";
import { act, fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SendEngagementScreen } from "../SendEngagementScreen";
import PN_ROUTES from "../../../navigation/routes";
import * as navigation from "../../../../../navigation/params/AppParamsList";
import { pnActivationUpsert } from "../../../store/actions";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";

jest.mock("../../components/SendEngagementComponent");

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  useIOToast: () => ({
    show: (_message: string, _options?: unknown) => jest.fn(),
    error: mockToastError,
    warning: (_message: string) => jest.fn(),
    success: mockToastSuccess,
    info: (_message: string) => jest.fn(),
    hideAll: () => jest.fn(),
    hide: (_id: number) => jest.fn()
  })
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("SendEngagementScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should popToTop if the close button is pressed upon first rendering", () => {
    const mockPopToTop = jest.fn();
    const mockReplace = jest.fn();
    jest
      .spyOn(navigation, "useIONavigation")
      .mockImplementation(() => ({ popToTop: mockPopToTop } as any));

    const screen = renderScreen();

    const closeButton = screen.getByTestId("close-button");
    fireEvent.press(closeButton);

    expect(mockPopToTop.mock.calls.length).toBe(1);
    expect(mockPopToTop.mock.calls[0].length).toBe(0);
    expect(mockReplace).toHaveBeenCalledTimes(0);
  });
  [false, true].forEach(systemNotificationsEnabled =>
    it(`should dispatch a 'pnActivationUpsert.request' when pressing the primary action, with proper flow for success and failure actions (systemNotificationsEnabled: ${systemNotificationsEnabled})`, () => {
      const mockPopToTop = jest.fn();
      const mockReplace = jest.fn();
      const mockSetOptions = jest.fn();
      jest.spyOn(navigation, "useIONavigation").mockImplementation(
        () =>
          ({
            popToTop: mockPopToTop,
            setOptions: mockSetOptions,
            replace: mockReplace
          } as any)
      );

      const screen = renderScreen(systemNotificationsEnabled);

      const closeButton = screen.getByTestId("primary-action");
      fireEvent.press(closeButton);

      expect(mockSetOptions.mock.calls.length).toBe(0);
      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);

      const expectedAction = pnActivationUpsert.request({
        value: true,
        onSuccess: () => undefined,
        onFailure: () => undefined
      });
      const argument = mockDispatch.mock.calls[0][0];
      expect(argument).toBeDefined();
      expect(argument.type).toEqual(expectedAction.type);
      expect(argument.payload.value).toEqual(expectedAction.payload.value);
      expect(argument.payload.onFailure).toBeDefined();
      expect(argument.payload.onSuccess).toBeDefined();

      argument.payload.onSuccess();
      expect(mockToastSuccess.mock.calls.length).toBe(1);
      expect(mockToastSuccess.mock.calls[0].length).toBe(1);
      expect(mockToastSuccess.mock.calls[0][0]).toEqual(
        I18n.t("features.pn.aar.serviceActivation.serviceActivated")
      );
      if (systemNotificationsEnabled) {
        expect(mockPopToTop.mock.calls.length).toEqual(1);
        expect(mockPopToTop.mock.calls[0].length).toEqual(0);
        expect(mockReplace).toHaveBeenCalledTimes(0);
      } else {
        expect(mockPopToTop.mock.calls.length).toEqual(0);
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT
            }
          }
        );
      }

      act(() => {
        argument.payload.onFailure();
      });
      expect(mockSetOptions.mock.calls.length).toBe(1);
      expect(mockSetOptions.mock.calls[0].length).toBe(1);
      expect(mockSetOptions.mock.calls[0][0]).toEqual({ headerShown: false });
    })
  );
});

const renderScreen = (systemNotificationsEnabled: boolean = false) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const testState = {
    ...baseState,
    notifications: {
      ...baseState.notifications,
      environment: {
        ...baseState.notifications.environment,
        systemNotificationsEnabled
      }
    }
  } as GlobalState;
  const store = createStore(appReducer, testState as any);
  return renderScreenWithNavigationStoreContext(
    () => <SendEngagementScreen />,
    PN_ROUTES.ENGAGEMENT_SCREEN,
    {},
    store
  );
};
