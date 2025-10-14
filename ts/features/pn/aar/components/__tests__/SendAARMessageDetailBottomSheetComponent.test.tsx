import { act } from "@testing-library/react-native";
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

  it("should call 'present' on hardware back button press", () => {
    jest
      .spyOn(BACK_BUTTON, "useHardwareBackButton")
      .mockImplementation(async cb => {
        await act(async () => {
          const result = cb();
          expect(presentMock).toHaveBeenCalledTimes(1);
          expect(result).toBe(false);
        });
      });

    renderComponent();
  });
  describe("onSecondaryActionPress navigation behavior", () => {
    test.each([
      [false, "replace"],
      [true, "popToTop"]
    ])(
      "when isPnServiceEnabled is %s it calls navigation.%s",
      async (isEnabled, navigationMethod) => {
        getStateMock.mockReturnValue({});
        (BANNER.isPnServiceEnabled as jest.Mock).mockReturnValue(isEnabled);

        renderComponent();

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
                screen: PN_ROUTES.ENGAGEMENT_SCREEN
              }
            }
          );
        } else {
          expect(popToTopMock.mock.calls.length).toEqual(1);
          expect(popToTopMock.mock.calls[0].length).toEqual(0);
          expect(replaceMock).toHaveBeenCalledTimes(0);
        }
      }
    );
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const aarBottomSheetRef: RefObject<(() => void) | undefined> = {
    current: undefined
  };

  const rendered = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <SendAARMessageDetailBottomSheetComponent
        aarBottomSheetRef={aarBottomSheetRef}
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
