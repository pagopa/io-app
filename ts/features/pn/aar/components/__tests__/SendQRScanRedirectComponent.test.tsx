import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URLUTILS from "../../../../../utils/url";
import { SendQRScanRedirectComponent } from "../SendQRScanRedirectComponent";
import PN_ROUTES from "../../../navigation/routes";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as analytics from "../../analytics";

const sendNotificationServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;
const aarUrl = "https://example.com";

const mockPopToTop = jest.fn();
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const navigationModule = jest.requireActual("@react-navigation/native");
  return {
    ...navigationModule,
    useNavigation: () => ({
      ...navigationModule.useNavigation(),
      popToTop: mockPopToTop,
      replace: mockReplace
    })
  };
});

describe("SendQRScanRedirectComponent", () => {
  const mockOpenWebUrl = jest.fn();

  const spiedOnMockedTrackSendQRCodeScanRedirect = jest
    .spyOn(analytics, "trackSendQRCodeScanRedirect")
    .mockImplementation();
  const spiedOnMockedTrackSendQRCodeScanRedirectConfirmed = jest
    .spyOn(analytics, "trackSendQRCodeScanRedirectConfirmed")
    .mockImplementation();
  const spiedOnMockedTrackSendQRCodeScanRedirectDismissed = jest
    .spyOn(analytics, "trackSendQRCodeScanRedirectDismissed")
    .mockImplementation();

  beforeAll(() => {
    jest.spyOn(URLUTILS, "openWebUrl").mockImplementation(mockOpenWebUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot and track the screen view", () => {
    const { toJSON } = renderComponent();

    expect(toJSON()).toMatchSnapshot();
    expect(spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls.length).toBe(1);
    expect(spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls[0].length).toBe(
      0
    );
    expect(
      spiedOnMockedTrackSendQRCodeScanRedirectConfirmed.mock.calls.length
    ).toBe(0);
    expect(
      spiedOnMockedTrackSendQRCodeScanRedirectDismissed.mock.calls.length
    ).toBe(0);
  });

  [false, true].forEach(sendServiceActive =>
    [false, true].forEach(notificationPermissionsEnabled => {
      const shouldNavigateToEngagementScreen = !sendServiceActive;
      const shouldNavigateToNotificationPermissionsScreen =
        sendServiceActive && !notificationPermissionsEnabled;

      it(`should call 'openWebUrl' when primary action is pressed, track proper analytics events and ${
        shouldNavigateToEngagementScreen
          ? "navigate to service engagment screen"
          : shouldNavigateToNotificationPermissionsScreen
          ? "navigate to notification permissions screen"
          : "popToTop"
      } when SEND service is ${
        sendServiceActive ? "" : "not "
      }active and notifications permissions are ${
        notificationPermissionsEnabled ? "" : "not "
      }enabled`, () => {
        const { getByTestId } = renderComponent(
          sendServiceActive,
          notificationPermissionsEnabled
        );

        const button = getByTestId("primary-action");
        expect(mockOpenWebUrl).toHaveBeenCalledTimes(0); // the function should not have been called before the button press

        fireEvent(button, "press");

        expect(spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls.length).toBe(
          1
        );
        expect(
          spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls[0].length
        ).toBe(0);
        expect(
          spiedOnMockedTrackSendQRCodeScanRedirectConfirmed.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendQRCodeScanRedirectConfirmed.mock.calls[0].length
        ).toBe(0);

        expect(mockOpenWebUrl).toHaveBeenCalledWith(aarUrl);
        expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);

        if (shouldNavigateToEngagementScreen) {
          expect(mockReplace.mock.calls.length).toBe(1);
          expect(mockReplace.mock.calls[0].length).toBe(2);
          expect(mockReplace.mock.calls[0][0]).toBe(
            MESSAGES_ROUTES.MESSAGES_NAVIGATOR
          );
          expect(mockReplace.mock.calls[0][1]).toEqual({
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.ENGAGEMENT_SCREEN
            }
          });
          expect(mockPopToTop.mock.calls.length).toBe(0);
        } else if (shouldNavigateToNotificationPermissionsScreen) {
          // TODO check for navigation to notification permissions screen
          expect(mockPopToTop.mock.calls.length).toBe(0);
        } else {
          expect(mockReplace.mock.calls.length).toBe(0);
          expect(mockPopToTop.mock.calls.length).toBe(1);
          expect(mockPopToTop.mock.calls[0].length).toBe(0);
        }
      });
    })
  );
  it("should call popToTop and track proper analytics when the header action is pressed", () => {
    const { getByTestId } = renderComponent();
    const header = getByTestId("header-close");
    fireEvent(header, "press");
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    expect(mockPopToTop.mock.calls.length).toBe(1);
    expect(mockPopToTop.mock.calls[0].length).toBe(0);
    expect(spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls.length).toBe(1);
    expect(spiedOnMockedTrackSendQRCodeScanRedirect.mock.calls[0].length).toBe(
      0
    );
    expect(
      spiedOnMockedTrackSendQRCodeScanRedirectConfirmed.mock.calls.length
    ).toBe(0);
    expect(
      spiedOnMockedTrackSendQRCodeScanRedirectDismissed.mock.calls.length
    ).toBe(1);
    expect(
      spiedOnMockedTrackSendQRCodeScanRedirectDismissed.mock.calls[0].length
    ).toBe(0);
  });
});
function renderComponent(
  sendServiceActive: boolean = true,
  notificationPermissionsEnabled: boolean = true
) {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState,
    notifications: {
      ...baseState.notifications,
      environment: {
        ...baseState.notifications.environment,
        systemNotificationsEnabled: notificationPermissionsEnabled
      }
    },
    features: {
      ...baseState.features,
      services: {
        ...baseState.features.services,
        details: {
          ...baseState.features.services.details,
          preferencesById: {
            ...baseState.features.services.details.preferencesById,
            [sendNotificationServiceId]: pot.some({
              id: sendNotificationServiceId,
              kind: "success",
              value: {
                can_access_message_read_status: true,
                email: true,
                inbox: sendServiceActive,
                push: true,
                settings_version: 0
              }
            })
          }
        }
      }
    },
    remoteConfig: O.some({
      cgn: {
        enabled: true
      },
      pn: {
        notificationServiceId: sendNotificationServiceId
      }
    })
  } as GlobalState;
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQRScanRedirectComponent aarUrl={aarUrl} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
}
