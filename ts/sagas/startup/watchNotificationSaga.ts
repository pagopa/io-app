import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { ApplicationState } from "../../store/actions/application";
import {
  navigateToMessageRouterScreen,
  navigateToPaginatedMessageRouterAction
} from "../../store/actions/navigation";
import { clearNotificationPendingMessage } from "../../store/actions/notifications";
import { pendingMessageStateSelector } from "../../store/reducers/notifications/pendingMessage";
import { isPaymentOngoingSelector } from "../../store/reducers/wallet/payment";
import { usePaginatedMessages } from "../../config";
import NavigationService from "../../navigation/NavigationService";
import { UIMessageId } from "../../store/reducers/entities/messages/types";

/**
 * Check if the user presses on a notification and redirect to the
 * related message if any payment flow has been started
 * @param lastState previous application state
 * @param newState  current application state
 */
export function* watchNotificationSaga(
  lastState: ApplicationState,
  newState: ApplicationState
): SagaIterator {
  if (lastState !== "active" && newState === "active") {
    // Check if there is a payment ongoing
    const isPaymentOngoing: ReturnType<typeof isPaymentOngoingSelector> =
      yield* select(isPaymentOngoingSelector);

    // Check if we have a pending notification message
    const pendingMessageState: ReturnType<typeof pendingMessageStateSelector> =
      yield* select(pendingMessageStateSelector);

    // We only navigate to the new message from a push if we're not in a
    // payment flow
    if (!isPaymentOngoing && pendingMessageState) {
      // We have a pending notification message to handle
      const messageId = pendingMessageState.id;

      // Remove the pending message from the notification state
      yield* put(clearNotificationPendingMessage());

      // Navigate to message details screen
      if (usePaginatedMessages) {
        NavigationService.dispatchNavigationAction(
          navigateToPaginatedMessageRouterAction({
            messageId: messageId as UIMessageId,
            isArchived: false
          })
        );
      } else {
        yield* call(navigateToMessageRouterScreen, { messageId });
      }
    }
  }
}
