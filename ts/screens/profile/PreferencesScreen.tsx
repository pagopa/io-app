/**
 * Implements the preferences screen where the user can see and update his
 * preferences about notifications, calendar, services, messages and languages
 */
import React, { ComponentProps, useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";

type PreferencesNavListItem = {
  value: string;
  condition?: boolean;
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

  const navigateToServicePreferenceScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_SERVICES
    });
  }, []);

  const navigateToEmailForwardingPreferenceScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
    });
  }, []);

  const navigateToCalendarPreferenceScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_CALENDAR
    });
  }, []);

  const navigateToLanguagePreferenceScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_LANGUAGE
    });
  }, []);

  const navigateToNotificationPreferenceScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS
    });
  }, []);

  const preferencesNavListItems: ReadonlyArray<PreferencesNavListItem> = [
    {
      // Notifications
      value: I18n.t("profile.preferences.list.notifications.title"),
      description: I18n.t("profile.preferences.list.notifications.subtitle"),
      onPress: navigateToNotificationPreferenceScreen
    },
    {
      // Calendar
      value: I18n.t("profile.preferences.list.preferred_calendar.title"),
      description: I18n.t(
        "profile.preferences.list.preferred_calendar.description"
      ),
      onPress: navigateToCalendarPreferenceScreen
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
  }: ListRenderItemInfo<PreferencesNavListItem>) => 
    // If condition is either true or undefined, render the item
     (
      <ListItemNav
        accessibilityLabel={value}
        value={value}
        description={description}
        onPress={onPress}
        testID={testID}
      />
    )
  ;

  const filteredPreferencesNavListItems = preferencesNavListItems.filter(
    item => item.condition !== false
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
    >
      <FlatList
        scrollEnabled={false}
        keyExtractor={(item: PreferencesNavListItem, index: number) =>
          `${item.value}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={filteredPreferencesNavListItems}
        renderItem={renderPreferencesNavItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default PreferencesScreen;
