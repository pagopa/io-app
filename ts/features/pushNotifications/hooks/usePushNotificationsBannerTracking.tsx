import { useEffect } from "react";
import { useIOSelector, useIOStore } from "../../../store/hooks";
import {
  isForceDismissAndNotUnreadMessagesHiddenSelector,
  unreadMessagesCountAfterForceDismissionSelector
} from "../store/selectors/notificationsBannerDismissed";
import { trackPushNotificationBannerStillHidden } from "../analytics";

export const usePushNotificationsBannerTracking = () => {
  const store = useIOStore();
  const isBannerForceDismissHidden = useIOSelector(
    isForceDismissAndNotUnreadMessagesHiddenSelector
  );

  useEffect(() => {
    if (isBannerForceDismissHidden) {
      const unreadMessageCountMaybe =
        unreadMessagesCountAfterForceDismissionSelector(store.getState());
      if (unreadMessageCountMaybe != null) {
        trackPushNotificationBannerStillHidden(unreadMessageCountMaybe);
      }
    }
  }, [isBannerForceDismissHidden, store]);

  return undefined;
};
