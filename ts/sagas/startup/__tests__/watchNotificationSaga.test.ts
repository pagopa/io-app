import { testSaga } from "redux-saga-test-plan";
import { navigateToPaginatedMessageRouterAction } from "../../../store/actions/navigation";
import { clearNotificationPendingMessage } from "../../../store/actions/notifications";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../../../store/reducers/notifications/pendingMessage";
import { isPaymentOngoingSelector } from "../../../store/reducers/wallet/payment";
import { watchNotificationSaga } from "../watchNotificationSaga";

describe("watchNotificationSaga", () => {
  const mockedPendingMessageState: PendingMessageState = {
    id: "M01",
    foreground: true
  };

  it("make the app navigate to the message detail when the user press on a notification", () => {
    testSaga(watchNotificationSaga, "inactive", "active")
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .put(clearNotificationPendingMessage())
      .next()
      .call(navigateToPaginatedMessageRouterAction, {
        messageId: mockedPendingMessageState.id as UIMessageId,
        fromNotification: true
      })
      .next()
      .isDone();
  });

  it("does nothing if the app return active during a payment", () => {
    testSaga(watchNotificationSaga, "inactive", "active")
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .isDone();
  });

  it("does nothing if there are any pending messages", () => {
    testSaga(watchNotificationSaga, "inactive", "active")
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .select(pendingMessageStateSelector)
      .next(null)
      .isDone();
  });
});
