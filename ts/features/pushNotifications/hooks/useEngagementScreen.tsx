import { useEffect } from "react";
import { useIOSelector } from "../../../store/hooks";
import { shouldShowEngagementScreenSelector } from "../store/reducers";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { NOTIFICATIONS_ROUTES } from "../navigation/routes";

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
