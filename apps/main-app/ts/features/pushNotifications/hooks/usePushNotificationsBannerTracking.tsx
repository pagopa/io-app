import { useEffect } from "react";

import { useIOSelector, useIOStore } from "../../../store/hooks";
import { trackPushNotificationBannerStillHidden } from "../analytics";
import {
  isForceDismissAndNotUnreadMessagesHiddenSelector,
  unreadMessagesCountAfterForceDismissionSelector
} from "../store/selectors/notificationsBannerDismissed";

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
