import { act, fireEvent } from "@testing-library/react-native";
import { Action, createStore, Store } from "redux";

import * as HEADER_SECOND_LEVEL from "../../../../hooks/useHeaderSecondLevel";
import ROUTES from "../../../../navigation/routes";
import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { successGetMessageDataFor } from "../../__mocks__/messageData";
import * as ANALYTICS from "../../analytics";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import {
  cancelGetMessageDataAction,
  getMessageDataAction
} from "../../store/actions";
import { MessageRouterScreen } from "../MessageRouterScreen";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("../../components/MessageRouter/MessageRouterScreenErrorComponent");
jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

const mockMessageContentNavigator = jest.fn();
jest.mock("../../navigation/MessageContentNavigator", () => ({
  MessageContentNavigator: (props: Record<string, unknown>) => {
    const { View } = jest.requireActual("react-native");
    mockMessageContentNavigator(props);
    return <View testID="mock-message-content-navigator" />;
  }
}));

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";
const OTHER_MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJZ";

describe("MessageRouterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([false, true])(
    "should request the message data on mount (fromNotification %s)",
    fromNotification => {
      const { dispatchSpy } = renderScreen(fromNotification);
      expect(dispatchSpy).toHaveBeenCalledWith(
        getMessageDataAction.request({
          messageId: MESSAGE_ID,
          fromPushNotification: fromNotification
        })
      );
    }
  );

  type SkeletonScenario = {
    name: string;
    previousOutcome?: Action;
    update?: Action;
  };
  const skeletonScenarios: ReadonlyArray<SkeletonScenario> = [
    {
      name: "while loading"
    },
    {
      name: "while waiting for a retry after a session expiration",
      update: startApplicationInitialization({ handleSessionExpiration: true })
    },
    {
      name: "when the store holds the outcome of a previous message",
      previousOutcome: getMessageDataAction.success(
        successGetMessageDataFor(OTHER_MESSAGE_ID)
      )
    }
  ];

  it.each(skeletonScenarios)(
    "should show the skeleton with the header $name",
    ({ previousOutcome, update }) => {
      const spiedUseHeaderSecondLevel = jest.spyOn(
        HEADER_SECOND_LEVEL,
        "useHeaderSecondLevel"
      );
      const { getByTestId, queryByTestId, store } = renderScreen(
        false,
        previousOutcome
      );
      if (update) {
        act(() => {
          store.dispatch(update);
        });
      }

      expect(getByTestId("message-details-skeleton")).toBeTruthy();
      expect(queryByTestId("mock-message-content-navigator")).toBeNull();
      expect(queryByTestId("mock-msgRouterErrorComponent")).toBeNull();
      expect(spiedUseHeaderSecondLevel).toHaveBeenLastCalledWith({
        title: "",
        supportRequest: true,
        headerShown: true
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  it.each([false, true])(
    "should show the loaded message with the header of its content (fromNotification %s)",
    fromNotification => {
      const spiedUseHeaderSecondLevel = jest.spyOn(
        HEADER_SECOND_LEVEL,
        "useHeaderSecondLevel"
      );
      const { getByTestId, queryByTestId, store } =
        renderScreen(fromNotification);
      const successData = successGetMessageDataFor(MESSAGE_ID);

      act(() => {
        store.dispatch(getMessageDataAction.success(successData));
      });

      expect(getByTestId("mock-message-content-navigator")).toBeTruthy();
      expect(queryByTestId("message-details-skeleton")).toBeNull();
      expect(mockMessageContentNavigator).toHaveBeenLastCalledWith({
        message: successData
      });
      expect(spiedUseHeaderSecondLevel).toHaveBeenLastCalledWith({
        title: "",
        supportRequest: true,
        headerShown: false
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  it.each([false, true])(
    "should track the opening once the message is loaded (fromNotification %s)",
    fromNotification => {
      const spiedTrackOpenMessage = jest
        .spyOn(ANALYTICS, "trackOpenMessageFromSuccessData")
        .mockImplementation();
      const { store } = renderScreen(fromNotification);
      expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(0);
      const successData = successGetMessageDataFor(MESSAGE_ID);

      act(() => {
        store.dispatch(getMessageDataAction.success(successData));
      });
      act(() => {
        store.dispatch(applicationChangeState("background"));
      });

      expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(1);
      expect(spiedTrackOpenMessage).toHaveBeenCalledWith(
        successData,
        fromNotification
      );
    }
  );

  type NotTrackedScenario = {
    name: string;
    outcome?: Action;
    previousOutcome?: Action;
  };
  const notTrackedScenarios: ReadonlyArray<NotTrackedScenario> = [
    { name: "while loading" },
    {
      name: "when the loading fails",
      outcome: getMessageDataAction.failure({ phase: "messageDetails" })
    },
    {
      name: "when the message is blocked from a push notification",
      outcome: getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    },
    {
      name: "for the outcome of a previous request",
      previousOutcome: getMessageDataAction.success(
        successGetMessageDataFor(MESSAGE_ID)
      )
    }
  ];

  it.each(notTrackedScenarios)(
    "should not track the opening $name",
    ({ outcome, previousOutcome }) => {
      const spiedTrackOpenMessage = jest
        .spyOn(ANALYTICS, "trackOpenMessageFromSuccessData")
        .mockImplementation();
      const { store } = renderScreen(true, previousOutcome);

      if (outcome) {
        act(() => {
          store.dispatch(outcome);
        });
      }

      expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(0);
    }
  );

  it("should track the opening once when the message is loaded after a retry", () => {
    const spiedTrackOpenMessage = jest
      .spyOn(ANALYTICS, "trackOpenMessageFromSuccessData")
      .mockImplementation();
    const { getByTestId, store } = renderScreen(false);
    act(() => {
      store.dispatch(getMessageDataAction.failure({ phase: "messageDetails" }));
    });
    fireEvent.press(getByTestId("messageRouterError-retry-button"));
    expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(0);
    const successData = successGetMessageDataFor(MESSAGE_ID);

    act(() => {
      store.dispatch(getMessageDataAction.success(successData));
    });

    expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(1);
    expect(spiedTrackOpenMessage).toHaveBeenCalledWith(successData, false);
  });

  it("should show the error with the header when the loading fails", () => {
    const spiedUseHeaderSecondLevel = jest.spyOn(
      HEADER_SECOND_LEVEL,
      "useHeaderSecondLevel"
    );
    const { getByTestId, queryByTestId, store } = renderScreen(false);

    act(() => {
      store.dispatch(getMessageDataAction.failure({ phase: "messageDetails" }));
    });

    expect(getByTestId("mock-msgRouterErrorComponent")).toBeTruthy();
    expect(queryByTestId("message-details-skeleton")).toBeNull();
    expect(spiedUseHeaderSecondLevel).toHaveBeenLastCalledWith({
      title: "",
      supportRequest: true,
      headerShown: true
    });
  });

  it("should go back without cancelling anything when cancel is pressed on the error", () => {
    const { dispatchSpy, getByTestId, store } = renderScreen(false);
    act(() => {
      store.dispatch(getMessageDataAction.failure({ phase: "messageDetails" }));
    });
    dispatchSpy.mockClear();

    fireEvent.press(getByTestId("messageRouterError-cancel-button"));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).not.toHaveBeenCalledWith(cancelGetMessageDataAction());
  });

  it("should request the message data again when retry is pressed on the error", () => {
    const { dispatchSpy, getByTestId, queryByTestId, store } =
      renderScreen(true);
    act(() => {
      store.dispatch(getMessageDataAction.failure({ phase: "messageDetails" }));
    });
    dispatchSpy.mockClear();

    fireEvent.press(getByTestId("messageRouterError-retry-button"));

    expect(dispatchSpy).toHaveBeenCalledWith(
      getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: true
      })
    );
    expect(mockGoBack).not.toHaveBeenCalled();
    expect(getByTestId("message-details-skeleton")).toBeTruthy();
    expect(queryByTestId("mock-msgRouterErrorComponent")).toBeNull();
  });

  it("should navigate to the messages home when the message is blocked from a push notification", () => {
    const { getByTestId, store } = renderScreen(true);

    act(() => {
      store.dispatch(
        getMessageDataAction.failure({
          phase: "preconditions",
          blockedFromPushNotificationOpt: true
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
    expect(getByTestId("message-details-skeleton")).toBeTruthy();
  });

  it("should not navigate to the messages home for a blocked outcome of a previous request", () => {
    renderScreen(
      true,
      getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should cancel the loading when closed before the message is loaded", () => {
    const { dispatchSpy, unmount } = renderScreen(false);
    dispatchSpy.mockClear();

    unmount();

    expect(dispatchSpy).toHaveBeenCalledWith(cancelGetMessageDataAction());
  });

  it("should not cancel anything when closed after the message is loaded", () => {
    const { dispatchSpy, store, unmount } = renderScreen(false);
    act(() => {
      store.dispatch(
        getMessageDataAction.success(successGetMessageDataFor(MESSAGE_ID))
      );
    });
    dispatchSpy.mockClear();

    unmount();

    expect(dispatchSpy).not.toHaveBeenCalledWith(cancelGetMessageDataAction());
  });
});

const renderScreen = (fromNotification: boolean, previousOutcome?: Action) => {
  const activeState = appReducer(undefined, applicationChangeState("active"));
  const globalState = previousOutcome
    ? appReducer(activeState, previousOutcome)
    : activeState;
  const store: Store<GlobalState> = createStore(appReducer, globalState as any);
  const dispatchSpy = jest.spyOn(store, "dispatch");

  const renderResult = renderScreenWithNavigationStoreContext(
    MessageRouterScreen,
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    { messageId: MESSAGE_ID, fromNotification },
    store
  );
  return { ...renderResult, dispatchSpy, store };
};
