import { fireEvent } from "@testing-library/react-native";
import { RefObject } from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as BOTTOM_SHEET from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SendUserType } from "../../../../pushNotifications/analytics";
import PN_ROUTES from "../../../navigation/routes";
import * as BANNER from "../../../reminderBanner/reducer/bannerDismiss";
import * as ANALYTICS from "../../analytics";
import { SendAARMessageDetailBottomSheetComponent } from "../SendAARMessageDetailBottomSheetComponent";

const mockReplace = jest.fn();
const mockPopToTop = jest.fn();
jest.mock("../SendAARMessageDetailBottomSheet");
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      popToTop: mockPopToTop,
      replace: mockReplace
    })
  };
});

const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

describe("SendAARMessageDetailBottomSheetComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent("not_set");
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
    const { aarBottomSheetRef } = renderComponent("not_set");
    expect(aarBottomSheetRef.current).toBe(mockPresent);
  });

  sendUserTypes.forEach(sendUserType => {
    it(`should call trackSendAarNotificationClosureBack with proper parameters when the primary action is triggered (user type ${sendUserType})`, () => {
      jest.restoreAllMocks();

      const spiedOnMockedTrackSendAarNotificationClosureBack = jest
        .spyOn(ANALYTICS, "trackSendAarNotificationClosureBack")
        .mockImplementation();

      const component = renderComponent(sendUserType);

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
      ).toBe(sendUserType);
    });

    [undefined, false, true].forEach(sendServiceEnabled => {
      it(`should call trackSendAarNotificationClosureConfirm, dismiss and ${
        sendServiceEnabled ? "popToTop" : "navigate to engagement screen"
      } (user type ${sendUserType}, sendServiceEnabled ${sendServiceEnabled})`, () => {
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

        const component = renderComponent(sendUserType);

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
        ).toBe(sendUserType);

        expect(mockDismiss.mock.calls.length).toBe(1);
        expect(mockDismiss.mock.calls[0].length).toBe(0);

        if (sendServiceEnabled) {
          expect(mockPopToTop.mock.calls.length).toBe(1);
          expect(mockPopToTop.mock.calls[0].length).toBe(0);

          expect(mockReplace.mock.calls.length).toBe(0);
        } else {
          expect(mockPopToTop.mock.calls.length).toBe(0);

          expect(mockReplace.mock.calls.length).toBe(1);
          expect(mockReplace).toHaveBeenCalledWith(PN_ROUTES.MAIN, {
            screen: PN_ROUTES.ENGAGEMENT_SCREEN,
            params: {
              sendOpeningSource: "aar",
              sendUserType
            }
          });
        }
      });
    });
  });
});

const renderComponent = (sendUserType: SendUserType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const aarBottomSheetRef: RefObject<(() => void) | undefined> = {
    current: undefined
  };

  const rendered = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <SendAARMessageDetailBottomSheetComponent
        aarBottomSheetRef={aarBottomSheetRef}
        sendUserType={sendUserType}
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
