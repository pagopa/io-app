import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";

import { IOScrollViewCentredContent } from "../../../components/ui/IOScrollViewCentredContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../store/hooks";
import {
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { setEngagementScreenShown } from "../store/actions/environment";
import { openSystemNotificationSettingsScreen } from "../utils";

export const SystemNotificationPermissionsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const onDismiss = useCallback(() => {
    trackSystemNotificationPermissionScreenOutcome(
      "dismiss",
      "authentication",
      "not_set",
      "not_set"
    );
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          firstAction={{
            icon: "closeMedium",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: onDismiss
          }}
          ignoreSafeAreaMargin={true}
          title={""}
          type="singleAction"
        />
      )
    });

    trackSystemNotificationPermissionScreenShown(
      "authentication",
      "not_set",
      "not_set"
    );
    dispatch(setEngagementScreenShown());
  }, [dispatch, navigation, onDismiss]);

  return (
    <IOScrollViewCentredContent
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("notifications.modal.primaryButton"),
          onPress: () => {
            trackSystemNotificationPermissionScreenOutcome(
              "activate",
              "authentication",
              "not_set",
              "not_set"
            );
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
      description={I18n.t("notifications.modal.content")}
      pictogram="reactivate"
      title={I18n.t("notifications.modal.title")}
    />
  );
};
