import React, { useCallback, useEffect, useMemo } from "react";
import {
  AppState,
  FlatList,
  View,
  Platform,
  ListRenderItemInfo
} from "react-native";
import {
  Body,
  Divider,
  FooterWithButtons,
  H2,
  H6,
  IOStyles,
  IOVisualCostants,
  IconButton,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { openAppSettings } from "../../../utils/appSettings";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { checkNotificationPermissions } from "../utils";
import {
  pushNotificationPreviewEnabledSelector,
  pushNotificationRemindersEnabledSelector
} from "../../../store/reducers/profile";
import { notificationsInfoScreenConsent } from "../store/actions/notifications";
import {
  trackNotificationsOptInOpenSettings,
  trackNotificationsOptInReminderOnPermissionsOff,
  trackNotificationsOptInSkipSystemPermissions
} from "../analytics";

export const OnboardingNotificationsInfoScreenConsent = () => {
  const dispatch = useIODispatch();
  const safeAreaInsets = useSafeAreaInsets();
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

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async nextAppState => {
        if (nextAppState === "active") {
          const authorizationStatus = await checkNotificationPermissions();

          if (authorizationStatus) {
            dispatch(notificationsInfoScreenConsent());
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const goNext = useCallback(() => {
    // When this code executes, we know for sure that system notifications permissions are disabled,
    // otherwise the component would either have been skipped by the saga or it would have automatically
    // handled the given permission using the AppState listener (registered on the useEffect)
    trackNotificationsOptInSkipSystemPermissions();

    if (remindersEnabled || previewEnabled) {
      trackNotificationsOptInReminderOnPermissionsOff();
    }

    dispatch(notificationsInfoScreenConsent());
  }, [dispatch, previewEnabled, remindersEnabled]);

  const openSettings = useCallback(() => {
    trackNotificationsOptInOpenSettings();
    openAppSettings();
  }, []);

  const ListHeader = (
    <View>
      <H2>{I18n.t("onboarding.infoConsent.title")}</H2>
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
      <View
        style={{
          flexDirection: "row-reverse",
          paddingBottom: 18,
          paddingTop: 24
        }}
      >
        <View style={{ marginRight: IOVisualCostants.appMarginDefault }}>
          <IconButton
            icon="closeLarge"
            color="neutral"
            onPress={goNext}
            accessibilityLabel={I18n.t("accessibility.buttons.torch.turnOff")}
          />
        </View>
      </View>
      <FlatList
        data={instructions}
        renderItem={({ item, index }: ListRenderItemInfo<ListItemInfo>) => (
          <ListItemInfo {...item} label={`${item.label} ${index + 1}`} />
        )}
        contentContainerStyle={{
          marginHorizontal: IOVisualCostants.appMarginDefault
        }}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={ListHeader}
      />
      <View style={{ paddingBottom: IOStyles.footer.paddingBottom }}>
        <FooterWithButtons
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("onboarding.infoConsent.openSettings"),
              onPress: openSettings
            }
          }}
          type="SingleButton"
        />
      </View>
    </>
  );
};
