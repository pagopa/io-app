import { select } from "typed-redux-saga/macro";
import { differenceInCalendarDays } from "date-fns";
import * as O from "fp-ts/Option";
import PushNotification from "react-native-push-notification";
import { pipe } from "fp-ts/lib/function";
import i18n from "i18next";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { NotificationPayload } from "../../../pushNotifications/utils/configurePushNotification.ts";
import { openWebUrl } from "../../../../utils/url.ts";

const EID_REISSUANCE_DEEP_LINK =
  "ioit://itw/identification/mode-selection?eidReissuing=true";

export function* checkEidExpiringSaga() {
  const pid = O.toUndefined(yield* select(itwCredentialsEidSelector));

  if (!pid) {
    return;
  }

  const now = Date.now();
  const jwtExpireDays = differenceInCalendarDays(pid.jwt.expiration, now);

  PushNotification.popInitialNotification(notification => {
    const decodedDeepLink = pipe(
      NotificationPayload.decode(notification),
      O.fromEither,
      O.chainNullableK(payload => payload.deepLink ?? payload.data?.deepLink),
      O.toUndefined
    );

    if (decodedDeepLink) {
      openWebUrl(decodedDeepLink);
    } else {
      if (jwtExpireDays > 1) {
        PushNotification.localNotification({
          id: "itw_reissuing_eid_notification",
          category: "itw",
          channelId: "io_default_notification_channel",
          title: i18n.t(
            "features.itWallet.identification.localPushNotification.title"
          ),
          message: i18n.t(
            "features.itWallet.identification.localPushNotification.message"
          ),
          userInfo: {
            deepLink: EID_REISSUANCE_DEEP_LINK
          }
        });
      }
    }
  });
}
