import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { openSystemNotificationSettingsScreen } from "../utils";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import { setEngagementScreenShown } from "../store/actions/userBehaviour";
import {
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { IOScrollViewCentredContent } from "../../../components/ui/IOScrollViewCentredContent";

const styles = StyleSheet.create({
  headerContainer: {
    alignSelf: "flex-end",
    marginRight: IOVisualCostants.appMarginDefault,
    marginTop: IOVisualCostants.appMarginDefault
  }
});

export const SystemNotificationPermissionsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  // const safeAreaInsets = useSafeAreaInsets();

  const onDismiss = () => {
    trackSystemNotificationPermissionScreenOutcome("dismiss");
    navigation.goBack();
  };

  useEffect(() => {
    trackSystemNotificationPermissionScreenShown();
    dispatch(setEngagementScreenShown());
  }, [dispatch]);

  return (
    <>
      <View style={styles.headerContainer}>
        <IconButton
          icon="closeMedium"
          color="neutral"
          onPress={onDismiss}
          testID="notifications-modal-close-button"
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      </View>
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
    </>
  );

  /* return (
    <View
      style={[
        IOStyles.flex,
        {
          paddingBottom: safeAreaInsets.bottom
        }
      ]}
    >
      <View style={styles.headerContainer}>
        <IconButton
          icon="closeMedium"
          color="neutral"
          onPress={onDismiss}
          testID="notifications-modal-close-button"
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      </View>
      <WizardBody
        pictogram={"reactivate"}
        title={I18n.t("notifications.modal.title")}
        description={I18n.t("notifications.modal.content")}
      />
      <ContentWrapper>
        <ButtonSolid
          label={I18n.t("notifications.modal.primaryButton")}
          fullWidth={true}
          onPress={() => {
            trackSystemNotificationPermissionScreenOutcome("activate");
            openSystemNotificationSettingsScreen();
            navigation.goBack();
          }}
          testID="notifications-modal-open-system-settings-button"
        />

        <>
          <VSpacer size={24} />
          <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
            <ButtonLink
              label={I18n.t("notifications.modal.secondaryButton")}
              onPress={onDismiss}
              testID="notifications-modal-not-now-button"
            />
          </View>
          <VSpacer size={16} />
        </>
      </ContentWrapper>
    </View>
  ); */
};
