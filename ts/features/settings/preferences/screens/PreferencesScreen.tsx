/**
 * Implements the preferences screen where the user can see and update his
 * preferences about notifications, calendar, services, messages and languages
 */
import { ComponentProps, useCallback, useRef } from "react";
import { Alert, FlatList, ListRenderItemInfo, View } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { requestWriteCalendarPermission } from "../../../../utils/permission";
import { checkAndRequestPermission } from "../../../../utils/calendar";
import { openAppSettings } from "../../../../utils/appSettings";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { ContextualHelpPropsMarkdown } from "../../../../utils/help";

type PreferencesNavListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

const PreferencesScreen = () => {
  const navigation = useIONavigation();
  const titleRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(titleRef, 400 as Millisecond);
    }, [])
  );

  const navigateToServicePreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES
    });
  }, [navigation]);

  const navigateToEmailForwardingPreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
    });
  }, [navigation]);

  const navigateToCalendarPreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_CALENDAR
    });
  }, [navigation]);

  const navigateToLanguagePreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE
    });
  }, [navigation]);

  const navigateToNotificationPreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS
    });
  }, [navigation]);

  const navigateToAppearancePreferenceScreen = useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_APPEARANCE
    });
  }, [navigation]);

  const checkPermissionThenGoCalendar = async () => {
    await requestWriteCalendarPermission({
      title: I18n.t("permissionRationale.calendar.title"),
      message: I18n.t("permissionRationale.calendar.message"),
      buttonPositive: I18n.t("global.buttons.choose")
    });

    void checkAndRequestPermission()
      .then(calendarPermission => {
        if (calendarPermission.authorized) {
          navigateToCalendarPreferenceScreen();
        } else if (!calendarPermission.asked) {
          // Authorized is false (denied, restricted or undetermined)
          // If the user denied permission previously (not in this session)
          // prompt an alert to inform that his calendar permissions could have been turned off
          Alert.alert(
            I18n.t("messages.cta.calendarPermDenied.preferencesTitle"),
            I18n.t("messages.cta.calendarPermDenied.description"),
            [
              {
                text: I18n.t("messages.cta.calendarPermDenied.cancel"),
                style: "cancel"
              },
              {
                text: I18n.t("messages.cta.calendarPermDenied.ok"),
                style: "default",
                onPress: () => {
                  // open app settings to turn on the calendar permissions
                  openAppSettings();
                }
              }
            ],
            { cancelable: true }
          );
        }
      })
      .catch();
  };

  const preferencesNavListItems: ReadonlyArray<PreferencesNavListItem> = [
    {
      // Notifications
      value: I18n.t("profile.preferences.list.notifications.title"),
      description: I18n.t("profile.preferences.list.notifications.subtitle"),
      onPress: navigateToNotificationPreferenceScreen
    },
    {
      // Appearance
      value: I18n.t("profile.preferences.list.appearance.title"),
      description: I18n.t("profile.preferences.list.appearance.subtitle"),
      onPress: navigateToAppearancePreferenceScreen
    },
    {
      // Calendar
      value: I18n.t("profile.preferences.list.preferred_calendar.title"),
      description: I18n.t(
        "profile.preferences.list.preferred_calendar.description"
      ),
      onPress: checkPermissionThenGoCalendar
    },
    {
      // Service Contacts
      value: I18n.t("profile.preferences.list.service_contact.title"),
      description: I18n.t("profile.preferences.list.service_contact.subtitle"),
      onPress: navigateToServicePreferenceScreen
    },
    {
      // Email forwarding
      value: I18n.t("profile.preferences.list.send_email_messages.title"),
      description: I18n.t(
        "profile.preferences.list.send_email_messages.subtitle"
      ),
      onPress: navigateToEmailForwardingPreferenceScreen
    },
    {
      // Language
      value: I18n.t("profile.preferences.list.language.title"),
      description: I18n.t("profile.preferences.list.language.subtitle"),
      onPress: navigateToLanguagePreferenceScreen
    }
  ];

  const renderPreferencesNavItem = ({
    item: { value, description, onPress, testID }
  }: ListRenderItemInfo<PreferencesNavListItem>) => (
    <ListItemNav
      accessibilityLabel={`${value} ${description}`}
      value={value}
      description={description}
      onPress={onPress}
      testID={testID}
    />
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.preferences.title")
      }}
      description={I18n.t("profile.preferences.subtitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      headerActionsProp={{ showHelp: true }}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      ref={titleRef}
    >
      <FlatList
        scrollEnabled={false}
        keyExtractor={(item: PreferencesNavListItem, index: number) =>
          `${item.value}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={preferencesNavListItems}
        renderItem={renderPreferencesNavItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default PreferencesScreen;
