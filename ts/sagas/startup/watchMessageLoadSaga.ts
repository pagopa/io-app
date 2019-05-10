import { buffers, Channel, channel } from "redux-saga";
import { call, fork, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { totMessageFetchWorkers } from "../../config";
import { loadMessage as loadMessageAction } from "../../store/actions/messages";
import { loadMessage } from "../messages/messages";

/**
 * This generator listen for loadMessage.request actions and forward them
 * to a pool of created handlers.
 *
 * @param getMessage API call to fetch the message detail
 */
export function* watchMessageLoadSaga(
  getMessage: ReturnType<typeof BackendClient>["getMessage"]
) {
  // Create the channel used for the communication with the handlers.
  // The channel has a buffer with initial size of 10 requests.
  const requestsChannel: Channel<
    ActionType<typeof loadMessageAction.request>
  > = yield call(channel, buffers.expanding());

  // Start the handlers
  // tslint:disable-next-line:no-let
  for (let i = 0; i < totMessageFetchWorkers; i++) {
    yield fork(handleMessageLoadRequest, requestsChannel, getMessage);
  }

  while (true) {
    // Take the loadMessage request action and put back in the channel
    // to be processed by the handlers.
    const action = yield take(getType(loadMessageAction.request));
    requestsChannel.put(action);
  }
}

/**
 * A generator that listen for loadMessage.request from a channel and perform the
 * handling.
 *
 * @param requestsChannel The channel where to take the loadMessage.request actions
 * @param getMessage API call to fetch the message detail
 */
export function* handleMessageLoadRequest(
  requestsChannel: Channel<ActionType<typeof loadMessageAction.request>>,
  getMessage: ReturnType<typeof BackendClient>["getMessage"]
) {
  // Infinite loop that wait and process loadMessage requests from the channel
  while (true) {
    const action: ActionType<typeof loadMessageAction.request> = yield take(
      requestsChannel
    );

    const meta = action.payload;
    yield call(loadMessage, getMessage, meta);
  }
}
