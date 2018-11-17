import PushNotification from "react-native-push-notification";
import { Effect } from "redux-saga";
import { takeEvery } from "redux-saga/effects";
import { getType, ActionType } from "typesafe-actions";

import { localNotificationRequest } from "../../store/actions/notifications";

const triggerLocalPush = (
  action: ActionType<typeof localNotificationRequest>
) => {
  PushNotification.localNotification({
    message: action.payload
  });
};

/**
 * Watches requests to trigger local notifications.
 * This is mainly used for simulating push notifications in
 * the iOS emulator.
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchLocalNotificationRequests(): Iterator<Effect> {
  yield takeEvery(getType(localNotificationRequest), triggerLocalPush);
}
