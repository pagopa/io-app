import { select } from "typed-redux-saga/macro";
import { differenceInCalendarDays } from "date-fns";
import * as O from "fp-ts/Option";
import PushNotification from "react-native-push-notification";
import { pipe } from "fp-ts/lib/function";
import i18n from "i18next";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { ItwNotificationPayload } from "../../../pushNotifications/utils/configurePushNotification.ts";
import { openWebUrl } from "../../../../utils/url.ts";

const EID_REISSUANCE_DEEP_LINK =
  "ioit://itw/identification/mode-selection?eidReissuing=true";

/**
 * This saga checks if the eID JWT is expiring soon and triggers a local push notification
 * to remind the user to reissue it.
 * The notification contains a deep link to the eID reissuance flow.
 */
export function* checkEidExpiringSaga() {
  const pid = O.toUndefined(yield* select(itwCredentialsEidSelector));

  // If there is no eID credential, exit the saga
  if (!pid) {
    return;
  }

  const now = Date.now();
  const jwtExpireDays = differenceInCalendarDays(pid.jwt.expiration, now);

  PushNotification.popInitialNotification(notification => {
    const decodedDeepLink = pipe(
      ItwNotificationPayload.decode(notification),
      O.fromEither,
      O.chainNullableK(payload => payload.deepLink ?? payload.data?.deepLink),
      O.toUndefined
    );
    // If the app was opened from the notification, navigate to the deep link and don't send another notification
    if (decodedDeepLink) {
      openWebUrl(decodedDeepLink);
    } else {
      // If the eID JWT is expiring in 1 day or less, show the local notification
      if (jwtExpireDays <= 1) {
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
