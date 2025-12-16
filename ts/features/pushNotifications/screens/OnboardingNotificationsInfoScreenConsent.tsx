import {
  Body,
  Divider,
  FooterActions,
  H2,
  H6,
  IOVisualCostants,
  IconButton,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect, useMemo } from "react";
import { AppState, FlatList, Platform, StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  pushNotificationPreviewEnabledSelector,
  pushNotificationRemindersEnabledSelector
} from "../../settings/common/store/selectors";
import {
  trackNotificationsOptInOpenSettings,
  trackNotificationsOptInReminderOnPermissionsOff,
  trackNotificationsOptInSkipSystemPermissions
} from "../analytics";
import { notificationsInfoScreenConsent } from "../store/actions/profileNotificationPermissions";
import {
  checkNotificationPermissions,
  openSystemNotificationSettingsScreen
} from "../utils";

const styles = StyleSheet.create({
  header: {
    alignSelf: "flex-end",
    flexDirection: "row",
    paddingBottom: 18,
    paddingRight: IOVisualCostants.appMarginDefault,
    paddingTop: 24
  },
  listContainer: {
    marginHorizontal: IOVisualCostants.appMarginDefault
  }
});

export const OnboardingNotificationsInfoScreenConsent = () => {
  const dispatch = useIODispatch();
  const remindersEnabled = useIOSelector(
    pushNotificationRemindersEnabledSelector
  );
  const previewEnabled = useIOSelector(pushNotificationPreviewEnabledSelector);

  const instructions = useMemo(
    () =>
      Platform.select<ReadonlyArray<ListItemInfo>>({
        ios: [
          {
            icon: "systemSettingsiOS",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.ios.step1"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.ios.step1"
            )
          },
          {
            icon: "systemNotificationsInstructions",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.ios.step2"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.ios.step2"
            )
          },
          {
            icon: "systemToggleInstructions",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.ios.step3"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.ios.step3"
            )
          }
        ],
        android: [
          {
            icon: "systemSettingsAndroid",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.android.step1"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.android.step1"
            )
          },
          {
            icon: "systemAppsAndroid",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.android.step2"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.android.step2"
            )
          },
          {
            icon: "productIOAppBlueBg",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.android.step3"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.android.step3"
            )
          },
          {
            icon: "systemNotificationsInstructions",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.android.step4"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.android.step4"
            )
          },
          {
            icon: "systemToggleInstructions",
            label: I18n.t("onboarding.infoConsent.instructions.label"),
            value: I18n.t("onboarding.infoConsent.instructions.android.step5"),
            accessibilityLabel: I18n.t(
              "onboarding.infoConsent.instructions.android.step5"
            )
          }
        ]
      }),
    []
  );

  const closeModalAndScreen = useCallback(() => {
    dispatch(notificationsInfoScreenConsent());
  }, [dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async nextAppState => {
        if (nextAppState === "active") {
          const authorizationStatus = await checkNotificationPermissions();

          if (authorizationStatus) {
            closeModalAndScreen();
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [closeModalAndScreen]);

  const goNext = useCallback(() => {
    // When this code executes, we know for sure that system notifications permissions are disabled,
    // otherwise the component would either have been skipped by the saga or it would have automatically
    // handled the given permission using the AppState listener (registered on the useEffect)
    trackNotificationsOptInSkipSystemPermissions();

    if (remindersEnabled || previewEnabled) {
      trackNotificationsOptInReminderOnPermissionsOff();
    }

    closeModalAndScreen();
  }, [closeModalAndScreen, previewEnabled, remindersEnabled]);

  const openSettings = useCallback(() => {
    trackNotificationsOptInOpenSettings();
    openSystemNotificationSettingsScreen();
  }, []);

  const ListHeader = (
    <View>
      <H2 accessibilityRole="header">
        {I18n.t("onboarding.infoConsent.title")}
      </H2>
      <VSpacer size={16} />
      <Body>{I18n.t("onboarding.infoConsent.subTitle")}</Body>
      <VSpacer size={16} />
      <H6 color="grey-700">
        {I18n.t("onboarding.infoConsent.instructions.title")}
      </H6>
      <VSpacer size={8} />
    </View>
  );

  return (
    <>
      <View style={styles.header}>
        <IconButton
          icon="closeLarge"
          color="neutral"
          onPress={goNext}
          testID="continue-btn"
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      </View>
      <FlatList
        data={instructions}
        renderItem={({ item, index }) => (
          <ListItemInfo {...item} label={`${item.label} ${index + 1}`} />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={ListHeader}
      />
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("onboarding.infoConsent.openSettings"),
            onPress: openSettings,
            testID: "settings-btn"
          }
        }}
      />
    </>
  );
};
