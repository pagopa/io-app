import { testSaga } from "redux-saga-test-plan";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../../store/reducers/pendingMessage";
import * as Analytics from "../../../messages/analytics";
import {
  handlePendingMessageStateIfAllowed,
  trackMessageNotificationTapIfNeeded
} from "../common";
import { isPaymentOngoingSelector } from "../../../../store/reducers/wallet/payment";
import { navigateToMessageRouterAction } from "../../utils/navigation";
import { UIMessageId } from "../../../messages/types";
import { clearNotificationPendingMessage } from "../../store/actions/notifications";
import { isArchivingDisabledSelector } from "../../../messages/store/reducers/archiving";
import NavigationService from "../../../../navigation/NavigationService";
import { navigateToMainNavigatorAction } from "../../../../store/actions/navigation";
import { resetMessageArchivingAction } from "../../../messages/store/actions/archiving";

describe("handlePendingMessageStateIfAllowed", () => {
  const mockedPendingMessageState: PendingMessageState = {
    id: "M01",
    foreground: true,
    trackEvent: false
  };

  it("make the app navigate to the message detail when the user press on a notification", () => {
    const dispatchNavigationActionParameter = navigateToMessageRouterAction({
      messageId: mockedPendingMessageState.id as UIMessageId,
      fromNotification: true
    });

    testSaga(handlePendingMessageStateIfAllowed, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .call(trackMessageNotificationTapIfNeeded, mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .put(clearNotificationPendingMessage())
      .next()
      .select(isArchivingDisabledSelector)
      .next(true)
      .call(
        NavigationService.dispatchNavigationAction,
        dispatchNavigationActionParameter
      )
      .next()
      .isDone();
  });

  it("make the app navigate to the message detail when the user press on a notification, resetting the navigation stack before", () => {
    const dispatchNavigationActionParameter = navigateToMessageRouterAction({
      messageId: mockedPendingMessageState.id as UIMessageId,
      fromNotification: true
    });

    testSaga(handlePendingMessageStateIfAllowed, true)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .call(trackMessageNotificationTapIfNeeded, mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .put(clearNotificationPendingMessage())
      .next()
      .call(navigateToMainNavigatorAction)
      .next()
      .select(isArchivingDisabledSelector)
      .next(true)
      .call(
        NavigationService.dispatchNavigationAction,
        dispatchNavigationActionParameter
      )
      .next()
      .isDone();
  });

  it("make the app navigate to the message detail when the user press on a notification, resetting the message archiving/restoring if such is disabled", () => {
    const dispatchNavigationActionParameter = navigateToMessageRouterAction({
      messageId: mockedPendingMessageState.id as UIMessageId,
      fromNotification: true
    });

    testSaga(handlePendingMessageStateIfAllowed, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .call(trackMessageNotificationTapIfNeeded, mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .put(clearNotificationPendingMessage())
      .next()
      .select(isArchivingDisabledSelector)
      .next(false)
      .put(resetMessageArchivingAction(undefined))
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        dispatchNavigationActionParameter
      )
      .next()
      .isDone();
  });

  it("does nothing if there is a payment going on", () => {
    testSaga(handlePendingMessageStateIfAllowed, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .isDone();
  });

  it("does nothing if there are not pending messages", () => {
    testSaga(handlePendingMessageStateIfAllowed, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(null)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .isDone();
  });

  it("does nothing if there are not pending messages and there is a payment going on", () => {
    testSaga(handlePendingMessageStateIfAllowed, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(null)
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .isDone();
  });
});

describe("trackMessageNotificationTapIfNeeded", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should call trackMessageNotificationTap when there is a PendingMessageState that requires tracking", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(jest.fn());
    const mockPendingMessageState = {
      id: "001",
      foreground: true,
      trackEvent: true
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).toBeCalledWith("001");
  });
  it("should not call trackMessageNotificationTap when there is a PendingMessageState that does not require tracking", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(jest.fn());
    const mockPendingMessageState = {
      id: "001",
      foreground: true,
      trackEvent: false
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
  it("should not call trackMessageNotificationTap when there is a PendingMessageState that does not have a tracking information", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(jest.fn());
    const mockPendingMessageState = {
      id: "001",
      foreground: true
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
  it("should not call trackMessageNotificationTap when there is not a PendingMessageState", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(jest.fn());
    trackMessageNotificationTapIfNeeded();
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
});
