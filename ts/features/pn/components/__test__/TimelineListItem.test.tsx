import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { fireEvent, render } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { TimelineListItem } from "../TimelineListItem";
import PN_ROUTES from "../../navigation/routes";
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";
import { GlobalState } from "../../../../store/reducers/types";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import * as ANALYTICS from "../../analytics";
import * as BOTTOM_SHEET from "../../../../utils/hooks/bottomSheet";
import * as URL_UTILS from "../../../../utils/url";
import * as SELECTORS from "../../../../store/reducers/backendStatus/remoteConfig";

jest.mock("../Timeline");

const fullHistory: NotificationStatusHistory = [
  {
    activeFrom: new Date(2024, 1, 1, 1, 10),
    relatedTimelineElements: [],
    status: "VIEWED"
  },
  {
    activeFrom: new Date(2024, 2, 3, 3, 15),
    relatedTimelineElements: [],
    status: "EFFECTIVE_DATE"
  },
  {
    activeFrom: new Date(2024, 3, 7, 5, 20),
    relatedTimelineElements: [],
    status: "UNREACHABLE"
  },
  {
    activeFrom: new Date(2024, 4, 10, 7, 25),
    relatedTimelineElements: [],
    status: "CANCELLED"
  },
  {
    activeFrom: new Date(2024, 5, 13, 9, 30),
    relatedTimelineElements: [],
    status: "IN_VALIDATION"
  },
  {
    activeFrom: new Date(2024, 6, 18, 11, 35),
    relatedTimelineElements: [],
    status: "ACCEPTED"
  },
  {
    activeFrom: new Date(2024, 7, 20, 13, 40),
    relatedTimelineElements: [],
    status: "REFUSED"
  },
  {
    activeFrom: new Date(2024, 8, 23, 15, 45),
    relatedTimelineElements: [],
    status: "DELIVERING"
  },
  {
    activeFrom: new Date(2024, 9, 25, 17, 50),
    relatedTimelineElements: [],
    status: "DELIVERED"
  },
  {
    activeFrom: new Date(2024, 10, 28, 19, 55),
    relatedTimelineElements: [],
    status: "PAID"
  }
];

const mockFrontendUrl = "https://www.domain.com/sendUrl";

const sendOpeningSources: ReadonlyArray<SendOpeningSource> = ["aar", "message"];
const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

describe("TimelineListItem", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  // eslint-disable-next-line sonarjs/cognitive-complexity
  [false, true].forEach(sendTemporaryMandateEnabled =>
    [[], fullHistory].forEach(history =>
      [false, true].forEach(linkDefined =>
        sendOpeningSources.forEach(openingSource => {
          const userType: SendUserType =
            openingSource === "message" ? "not_set" : "mandatory";
          it(`Should match snapshot (temporary mandate ${
            sendTemporaryMandateEnabled ? "enabled" : "disabled"
          }, ${history.length > 0 ? "with" : "no"} history, link ${
            linkDefined ? "defined" : "undefined"
          }, source ${openingSource}, type ${userType})`, () => {
            jest
              .spyOn(SELECTORS, "isAarInAppDelegationRemoteEnabledSelector")
              .mockImplementation(_ => sendTemporaryMandateEnabled);
            const component = renderComponent(
              history,
              linkDefined,
              openingSource,
              userType
            );
            expect(component.toJSON()).toMatchSnapshot();
          });
        })
      )
    )
  );
  sendOpeningSources.forEach(openingSource =>
    sendUserTypes.forEach(userType => {
      it(`Should call 'trackPNShowTimeline' upon press (source ${openingSource} user ${userType})`, () => {
        jest
          .spyOn(SELECTORS, "isAarInAppDelegationRemoteEnabledSelector")
          .mockImplementation(_ => true);
        const refUseIOBottomSheetModal = BOTTOM_SHEET.useIOBottomSheetModal;
        jest
          .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
          .mockImplementation(props => {
            const { bottomSheet } = refUseIOBottomSheetModal(props);
            return { present: jest.fn(), bottomSheet, dismiss: jest.fn() };
          });

        const spiedOnMockedTrackPNShowTimeline = jest
          .spyOn(ANALYTICS, "trackPNShowTimeline")
          .mockImplementation();

        const component = renderComponent(
          fullHistory,
          true,
          openingSource,
          userType
        );

        const pressable = component.getByTestId(
          "timeline_listitem_bottom_menu"
        );
        fireEvent.press(pressable);

        expect(spiedOnMockedTrackPNShowTimeline.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackPNShowTimeline.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedTrackPNShowTimeline.mock.calls[0][0]).toBe(
          openingSource
        );
        expect(spiedOnMockedTrackPNShowTimeline.mock.calls[0][1]).toBe(
          userType
        );
      });
    })
  );
  sendOpeningSources.forEach(openingSource =>
    sendUserTypes.forEach(userType => {
      const hasCTA = openingSource !== "aar";
      it(`Should ${
        hasCTA ? "" : "not "
      }call 'trackPNTimelineExternal' when tapping the internal bottom sheet CTA (source ${openingSource} user ${userType})`, () => {
        jest
          .spyOn(SELECTORS, "isAarInAppDelegationRemoteEnabledSelector")
          .mockImplementation(_ => true);
        const refUseIOBottomSheetModal = BOTTOM_SHEET.useIOBottomSheetModal;
        const spiedOnMockedUseIOBottomSheetModal = jest
          .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
          .mockImplementation(props => {
            const { bottomSheet } = refUseIOBottomSheetModal(props);
            return { present: jest.fn(), bottomSheet, dismiss: jest.fn() };
          });
        const spiedOnMockedHandleItemOnPress = jest
          .spyOn(URL_UTILS, "handleItemOnPress")
          .mockImplementation(_input => () => undefined);

        const spiedOnMockedTrackPNTimelineExternal = jest
          .spyOn(ANALYTICS, "trackPNTimelineExternal")
          .mockImplementation();

        renderComponent(fullHistory, true, openingSource, userType);

        // Unfortunately, bottom sheet's footer is not rendered since we have a mock
        // in the jest.setup file that replaces the main view with a modal (that does
        // not have the footer property). In order to render the footer, we have to
        // extract the original property and render it indipendently
        const bottomSheetProps =
          spiedOnMockedUseIOBottomSheetModal.mock.calls[0][0];
        const bottomSheetFooter = bottomSheetProps.footer;
        const renderedBottomSheetFooter = render(<>{bottomSheetFooter}</>);

        if (hasCTA) {
          const pressable = renderedBottomSheetFooter.getByTestId(
            "timeline_listitem_bottom_menu_alert"
          );
          fireEvent.press(pressable);

          expect(spiedOnMockedTrackPNTimelineExternal.mock.calls.length).toBe(
            1
          );
          expect(
            spiedOnMockedTrackPNTimelineExternal.mock.calls[0].length
          ).toBe(2);
          expect(spiedOnMockedTrackPNTimelineExternal.mock.calls[0][0]).toBe(
            openingSource
          );
          expect(spiedOnMockedTrackPNTimelineExternal.mock.calls[0][1]).toBe(
            userType
          );

          expect(spiedOnMockedHandleItemOnPress.mock.calls.length).toBe(1);
          expect(spiedOnMockedHandleItemOnPress.mock.calls[0].length).toBe(1);
          expect(spiedOnMockedHandleItemOnPress.mock.calls[0][0]).toBe(
            mockFrontendUrl
          );
        } else {
          const pressable = renderedBottomSheetFooter.queryByTestId(
            "timeline_listitem_bottom_menu_alert"
          );
          expect(pressable).toBeFalsy();
          expect(spiedOnMockedTrackPNTimelineExternal.mock.calls.length).toBe(
            0
          );
          expect(spiedOnMockedHandleItemOnPress.mock.calls.length).toBe(0);
        }
      });
    })
  );
});

const renderComponent = (
  history: NotificationStatusHistory,
  frontendUrlDefined: boolean,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState: GlobalState = {
    ...initialState,
    remoteConfig: frontendUrlDefined
      ? O.some({
          cgn: {
            enabled: false
          },
          newPaymentSection: {
            enabled: false,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          },
          fims: {
            enabled: false
          },
          pn: {
            frontend_url: mockFrontendUrl
          },
          itw: {
            enabled: true,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          }
        } as BackendStatus["config"])
      : O.none
  };
  const store = createStore(appReducer, finalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <TimelineListItem
        history={history}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
