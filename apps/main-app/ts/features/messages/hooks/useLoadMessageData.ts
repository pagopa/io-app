import { useCallback, useEffect, useState } from "react";

import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  RequestGetMessageDataActionType
} from "../store/actions";
import {
  INITIAL_STATE,
  isLoadingMessageDataSelector,
  messageGetStatusSelector
} from "../store/reducers/messageGetStatus";

/**
 * Load the data of the message shown by the details screen. The request starts
 * when the screen opens and is cancelled if the screen is closed before the
 * data has been loaded.
 */
export const useLoadMessageData = (
  messageId: string,
  fromPushNotification: boolean
) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const status = useIOSelector(messageGetStatusSelector);
  // Until this message is requested, the store can still hold the outcome of
  // the previous request, made for another message or for the same message
  // opened in another way
  const [lastRequest, setLastRequest] =
    useState<RequestGetMessageDataActionType>();

  const requestMessageData = useCallback(() => {
    dispatch(getMessageDataAction.request({ messageId, fromPushNotification }));
  }, [dispatch, fromPushNotification, messageId]);

  useEffect(() => {
    requestMessageData();
    setLastRequest({ messageId, fromPushNotification });
    return () => {
      if (isLoadingMessageDataSelector(store.getState(), messageId)) {
        dispatch(cancelGetMessageDataAction());
      }
    };
  }, [dispatch, fromPushNotification, messageId, requestMessageData, store]);

  const isRequested =
    lastRequest?.messageId === messageId &&
    lastRequest.fromPushNotification === fromPushNotification;
  return {
    status: isRequested ? status : INITIAL_STATE,
    retry: requestMessageData
  };
};
