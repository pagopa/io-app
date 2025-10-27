import { act, fireEvent } from "@testing-library/react-native";
import { RefObject } from "react";
import { createStore } from "redux";
import * as BACK_BUTTON from "../../../../../hooks/useHardwareBackButton";
import * as NAVIGATION from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as STORE_HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as BOTTOM_SHEET from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import * as BANNER from "../../../reminderBanner/reducer/bannerDismiss";
import { SendAARMessageDetailBottomSheetComponent } from "../SendAARMessageDetailBottomSheetComponent";
import * as ANALYTICS from "../../analytics";

describe("SendAARMessageDetailBottomSheetComponent", () => {
  const presentMock = jest.fn();
  const dismissMock = jest.fn();
  const replaceMock = jest.fn();
  const popToTopMock = jest.fn();
  const getStateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(BOTTOM_SHEET, "useIOBottomSheetModal").mockReturnValue({
      bottomSheet: <></>,
      present: presentMock,
      dismiss: dismissMock
    });

    jest.spyOn(STORE_HOOKS, "useIOStore").mockReturnValue({
      getState: getStateMock
    } as any);

    jest.spyOn(BACK_BUTTON, "useHardwareBackButton").mockImplementation();

    jest.spyOn(NAVIGATION, "useIONavigation").mockReturnValue({
      replace: replaceMock,
      popToTop: popToTopMock
    } as any);

    jest.spyOn(BANNER, "isPnServiceEnabled").mockReturnValue(false);
  });

  it("should assign 'present' to aarBottomSheetRef on mount", () => {
    const { aarBottomSheetRef } = renderComponent();
    expect(aarBottomSheetRef.current).toBe(presentMock);
  });

  [false, true].forEach(isDelegate =>
    it(`should call trackSendAarNotificationClosureBack with proper parameters when the primary action is triggered (isDelegate ${isDelegate})`, () => {
      jest.restoreAllMocks();
      /* const spiedOnMockedUseIOBottomSheetModal = jest.spyOn(
        BOTTOM_SHEET,
        "useIOBottomSheetModal"
      ); */
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
    })
  );

  describe("onSecondaryActionPress navigation behavior", () => {
    [false, true].forEach(isDelegate =>
      test.each([
        [false, "replace"],
        [true, "popToTop"]
      ])(
        `when isPnServiceEnabled is %s and user is ${
          isDelegate ? "delegate" : "recipient"
        } it calls navigation.%s`,
        async (isEnabled, navigationMethod) => {
          getStateMock.mockReturnValue({});
          (BANNER.isPnServiceEnabled as jest.Mock).mockReturnValue(isEnabled);

          renderComponent(isDelegate);

          await act(async () => {
            (
              BOTTOM_SHEET.useIOBottomSheetModal as jest.Mock
            ).mock.calls[0][0].component.props.onSecondaryActionPress();
          });

          expect(dismissMock).toHaveBeenCalledTimes(1);
          expect(dismissMock).toHaveBeenCalled();

          if (navigationMethod === "replace") {
            expect(popToTopMock.mock.calls.length).toEqual(0);
            expect(replaceMock).toHaveBeenCalledTimes(1);
            expect(replaceMock).toHaveBeenCalledWith(
              MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
              {
                screen: PN_ROUTES.MAIN,
                params: {
                  screen: PN_ROUTES.ENGAGEMENT_SCREEN,
                  params: {
                    sendOpeningSource: "aar",
                    sendUserType: isDelegate ? "mandatory" : "recipient"
                  }
                }
              }
            );
          } else {
            expect(popToTopMock.mock.calls.length).toEqual(1);
            expect(popToTopMock.mock.calls[0].length).toEqual(0);
            expect(replaceMock).toHaveBeenCalledTimes(0);
          }
        }
      )
    );
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
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
