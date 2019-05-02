import { addMinutes } from "date-fns";
import I18n from "i18n-js";
import PushNotification from "react-native-push-notification";
import { LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID_TAG } from "../utils/constants";

/*
 * Schedule a set of local notifications to remind the user to authenticate with spid
 */
function scheduleLocalNotifications() {
  const nowDate = new Date();
  // Configure the dates to schedule local notifications
  const oneDayDate = addMinutes(nowDate, 1);
  const threeDayDate = addMinutes(oneDayDate, 1);
  const oneWeekDate = addMinutes(threeDayDate, 1);
  const twoWeekDate = addMinutes(oneWeekDate, 1);
  const oneMonthDate = addMinutes(twoWeekDate, 1);
  const twoMonthDate = addMinutes(oneMonthDate, 1);
  const sixMonthDate = addMinutes(twoMonthDate, 1);
  const localNotificationDates: ReadonlyArray<Date> = [
    oneDayDate,
    threeDayDate,
    oneWeekDate,
    twoWeekDate,
    oneMonthDate,
    twoMonthDate,
    sixMonthDate
  ];

  localNotificationDates.forEach((scheduledDate: Date) =>
    PushNotification.localNotificationSchedule({
      title: I18n.t("global.localNotifications.spidLogin.title"),
      message: I18n.t("global.localNotifications.spidLogin.message"),
      date: scheduledDate,
      tag: LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID_TAG
    })
  );
}

export default scheduleLocalNotifications;
