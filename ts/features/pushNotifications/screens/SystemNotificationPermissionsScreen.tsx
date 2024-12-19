import { useCallback, useEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { openSystemNotificationSettingsScreen } from "../utils";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import {
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { IOScrollViewCentredContent } from "../../../components/ui/IOScrollViewCentredContent";
import { setEngagementScreenShown } from "../store/actions/environment";

export const SystemNotificationPermissionsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const onDismiss = useCallback(() => {
    trackSystemNotificationPermissionScreenOutcome("dismiss");
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          ignoreSafeAreaMargin={true}
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: onDismiss
          }}
        />
      )
    });

    trackSystemNotificationPermissionScreenShown();
    dispatch(setEngagementScreenShown());
  }, [dispatch, navigation, onDismiss]);

  return (
    <IOScrollViewCentredContent
      pictogram="reactivate"
      title={I18n.t("notifications.modal.title")}
      description={I18n.t("notifications.modal.content")}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("notifications.modal.primaryButton"),
          onPress: () => {
            trackSystemNotificationPermissionScreenOutcome("activate");
            openSystemNotificationSettingsScreen();
            navigation.goBack();
          },
          testID: "notifications-modal-open-system-settings-button"
        },
        secondary: {
          label: I18n.t("notifications.modal.secondaryButton"),
          onPress: onDismiss,
          testID: "notifications-modal-not-now-button"
        }
      }}
    />
  );
};
