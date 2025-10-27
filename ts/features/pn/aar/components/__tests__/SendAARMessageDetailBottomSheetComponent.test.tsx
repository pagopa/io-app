import { fireEvent } from "@testing-library/react-native";
import { RefObject } from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SendAARMessageDetailBottomSheetComponent } from "../SendAARMessageDetailBottomSheetComponent";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import * as ANALYTICS from "../../analytics";
import * as BANNER from "../../../reminderBanner/reducer/bannerDismiss";
import * as BOTTOM_SHEET from "../../../../../utils/hooks/bottomSheet";
import * as IO_NAVIGATION from "../../../../../navigation/params/AppParamsList";

describe("SendAARMessageDetailBottomSheetComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should assign 'present' to aarBottomSheetRef on mount", () => {
    const mockPresent = jest.fn();
    const refUseIOBottomSheetModal = BOTTOM_SHEET.useIOBottomSheetModal;
    jest
      .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
      .mockImplementation(props => {
        const { bottomSheet } = refUseIOBottomSheetModal(props);
        return {
          bottomSheet,
          dismiss: jest.fn(),
          present: mockPresent
        };
      });
    const { aarBottomSheetRef } = renderComponent();
    expect(aarBottomSheetRef.current).toBe(mockPresent);
  });

  [false, true].forEach(isDelegate => {
    it(`should call trackSendAarNotificationClosureBack with proper parameters when the primary action is triggered (isDelegate ${isDelegate})`, () => {
      jest.restoreAllMocks();

      const spiedOnMockedTrackSendAarNotificationClosureBack = jest
        .spyOn(ANALYTICS, "trackSendAarNotificationClosureBack")
        .mockImplementation();

      const component = renderComponent(isDelegate);

      const primaryButton = component.getByTestId("primary_button");
      fireEvent.press(primaryButton);

      expect(
        spiedOnMockedTrackSendAarNotificationClosureBack.mock.calls.length
      ).toBe(1);
      expect(
        spiedOnMockedTrackSendAarNotificationClosureBack.mock.calls[0].length
      ).toBe(1);
      expect(
        spiedOnMockedTrackSendAarNotificationClosureBack.mock.calls[0][0]
      ).toBe(isDelegate ? "mandatory" : "recipient");
    });

    [undefined, false, true].forEach(sendServiceEnabled => {
      it(`should call trackSendAarNotificationClosureConfirm, dismiss and ${
        sendServiceEnabled ? "popToTop" : "navigate to engagement screen"
      } (isDelegate ${isDelegate}, sendServiceEnabled ${sendServiceEnabled})`, () => {
        const mockPopToTop = jest.fn();
        const mockReplace = jest.fn();
        jest.spyOn(IO_NAVIGATION, "useIONavigation").mockImplementation(
          () =>
            ({
              popToTop: mockPopToTop,
              replace: mockReplace
            } as unknown as IO_NAVIGATION.IOStackNavigationProp<
              IO_NAVIGATION.AppParamsList,
              keyof IO_NAVIGATION.AppParamsList
            >)
        );

        const mockDismiss = jest.fn();
        const refUseIOBottomSheetModal = BOTTOM_SHEET.useIOBottomSheetModal;
        jest
          .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
          .mockImplementation(props => {
            const { bottomSheet } = refUseIOBottomSheetModal(props);
            return {
              bottomSheet,
              dismiss: mockDismiss,
              present: jest.fn()
            };
          });

        jest
          .spyOn(BANNER, "isPnServiceEnabled")
          .mockImplementation(() => sendServiceEnabled);

        const spiedOnMockedTrackSendAarNotificationClosureConfirm = jest
          .spyOn(ANALYTICS, "trackSendAarNotificationClosureConfirm")
          .mockImplementation();

        const component = renderComponent(isDelegate);

        const secondaryButton = component.getByTestId("secondary_button");
        fireEvent.press(secondaryButton);

        expect(
          spiedOnMockedTrackSendAarNotificationClosureConfirm.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAarNotificationClosureConfirm.mock.calls[0]
            .length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAarNotificationClosureConfirm.mock.calls[0][0]
        ).toBe(isDelegate ? "mandatory" : "recipient");

        expect(mockDismiss.mock.calls.length).toBe(1);
        expect(mockDismiss.mock.calls[0].length).toBe(0);

        if (sendServiceEnabled) {
          expect(mockPopToTop.mock.calls.length).toBe(1);
          expect(mockPopToTop.mock.calls[0].length).toBe(0);

          expect(mockReplace.mock.calls.length).toBe(0);
        } else {
          expect(mockPopToTop.mock.calls.length).toBe(0);

          expect(mockReplace.mock.calls.length).toBe(1);
          expect(mockReplace.mock.calls[0].length).toBe(2);
          expect(mockReplace.mock.calls[0][0]).toBe(
            MESSAGES_ROUTES.MESSAGES_NAVIGATOR
          );
          expect(mockReplace.mock.calls[0][1]).toEqual({
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.ENGAGEMENT_SCREEN,
              params: {
                sendOpeningSource: "aar",
                sendUserType: isDelegate ? "mandatory" : "recipient"
              }
            }
          });
        }
      });
    });
  });
});

const renderComponent = (isDelegate: boolean = false) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const aarBottomSheetRef: RefObject<(() => void) | undefined> = {
    current: undefined
  };

  const rendered = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <SendAARMessageDetailBottomSheetComponent
        aarBottomSheetRef={aarBottomSheetRef}
        isDelegate={isDelegate}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    createStore(appReducer, globalState as any)
  );

  return {
    ...rendered,
    aarBottomSheetRef
  };
};
