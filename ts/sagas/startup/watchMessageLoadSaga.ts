import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { buffers, Channel, channel } from "redux-saga";
import { call, fork, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { GetUserMessageT } from "../../../definitions/backend/requestTypes";
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
  getMessage: TypeofApiCall<GetUserMessageT>
) {
  // Create the channel used for the communication with the handlers.
  // The channel has a buffer with initial size of 10 requests.
  const requestsChannel: Channel<
    ActionType<typeof loadMessageAction.request>
  > = yield call(channel, buffers.expanding());

  // Start the handlers
  [...Array(totMessageFetchWorkers).keys()].forEach(
    yield fork(handleMessageLoadRequest, requestsChannel, getMessage)
  );

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
  getMessage: TypeofApiCall<GetUserMessageT>
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
