import { addDays, addMonths, addWeeks } from "date-fns";
import I18n from "i18n-js";
import PushNotification from "react-native-push-notification";
import { store } from "../App";
import { updateLocalNotificationsScheduled } from "../store/actions/notifications";
import { notificationsLocalScheduledSelector } from "../store/reducers/notifications/localScheduled";

const FIRST_ACCESS_SPID_TAG: string = "local_notification_spid";

/*
 * Schedule a set of local notifications to remind the user to authenticate with spid
 */
export const scheduleLocalNotificationsAccessSpid = () => {
  const isToSchedule = notificationsLocalScheduledSelector(store.getState())
    .isToSchedule;
  if (isToSchedule) {
    const nowDate = new Date();
    // Configure all the dates to schedule local notifications
    const oneDayDate = addDays(nowDate, 1);
    const threeDayDate = addDays(oneDayDate, 3);
    const oneWeekDate = addWeeks(threeDayDate, 1);
    const twoWeekDate = addWeeks(oneWeekDate, 2);
    const oneMonthDate = addMonths(twoWeekDate, 1);
    const twoMonthDate = addMonths(oneMonthDate, 2);
    const sixMonthDate = addMonths(twoMonthDate, 6);
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
        tag: FIRST_ACCESS_SPID_TAG,
        userInfo: { tag: FIRST_ACCESS_SPID_TAG }
      })
    );
    // Dispatch an action to save  that notifications are not to be scheduled anymore
    store.dispatch(updateLocalNotificationsScheduled(false));
  }
};

/*
 * Remove all the local notifications relating to authentication with spid
 */
export const removeScheduledNotificationAccessSpid = () => {
  PushNotification.cancelLocalNotifications({
    tag: FIRST_ACCESS_SPID_TAG
  });
};
