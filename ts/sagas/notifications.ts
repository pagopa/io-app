import {
  call,
  Effect,
  fork,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import DeviceInfo from 'react-native-device-info';
import {
  NOTIFICATIONS_TOKEN_UPDATE,
  SESSION_INITIALIZE_SUCCESS
} from "../store/actions/constants";
import { NotificationsTokenUpdate } from "../store/actions/notifications";
import { notificationsTokenSelector } from "../store/reducers/notifications/token";
import { Option } from "fp-ts/lib/Option";

function* manageInstallation(): Iterator<Effect> {
  // Get the notifications token
  let notificationsToken: Option<string> = yield select(
    notificationsTokenSelector
  );

  // Call the Proxy
  console.log(DeviceInfo.getInstanceID())
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, manageInstallation);
}
