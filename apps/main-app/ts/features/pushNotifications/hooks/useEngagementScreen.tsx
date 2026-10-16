import { useEffect } from "react";

import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { NOTIFICATIONS_ROUTES } from "../navigation/routes";
import { shouldShowEngagementScreenSelector } from "../store/reducers";

export const useEngagementScreen = () => {
  const navigation = useIONavigation();
  const shouldShowEngagementScreen = useIOSelector(
    shouldShowEngagementScreenSelector
  );
  useEffect(() => {
    if (shouldShowEngagementScreen) {
      navigation.navigate(NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS);
    }
  }, [navigation, shouldShowEngagementScreen]);
  return undefined;
};
