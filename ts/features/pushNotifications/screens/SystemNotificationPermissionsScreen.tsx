import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  IconButton,
  IOStyles,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { WizardBody } from "../../../components/screens/WizardScreen";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { openSystemNotificationSettingsScreen } from "../utils";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import { setEngagementScreenShown } from "../store/actions/userBehaviour";

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
  const safeAreaInsets = useSafeAreaInsets();

  const goBackCallback = useCallback(
    (openSystemNotificationSettings: boolean = false) => {
      if (openSystemNotificationSettings) {
        openSystemNotificationSettingsScreen();
      }
      navigation.goBack();
    },
    [navigation]
  );

  useEffect(() => {
    dispatch(setEngagementScreenShown());
  }, [dispatch]);

  return (
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
          onPress={() => goBackCallback()}
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
          onPress={() => goBackCallback(true)}
          testID="notifications-modal-open-system-settings-button"
        />

        <>
          <VSpacer size={24} />
          <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
            <ButtonLink
              label={I18n.t("notifications.modal.secondaryButton")}
              onPress={() => goBackCallback()}
              testID="notifications-modal-not-now-button"
            />
          </View>
          <VSpacer size={16} />
        </>
      </ContentWrapper>
    </View>
  );
};
