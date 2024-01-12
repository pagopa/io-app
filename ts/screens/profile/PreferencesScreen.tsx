/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ComponentProps } from "react";
import {
  Alert,
  FlatList,
  ListRenderItemInfo
} from "react-native";
import { connect } from "react-redux";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { remindersOptInEnabled } from "../../config";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailForwardingPreferenceScreen,
  navigateToLanguagePreferenceScreen,
  navigateToServicePreferenceScreen
} from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import {
  isCustomEmailChannelEnabledSelector,
  preferredLanguageSelector
} from "../../store/reducers/persistedPreferences";
import {
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { openAppSettings } from "../../utils/appSettings";
import {
  checkAndRequestPermission,
  convertLocalCalendarName
} from "../../utils/calendar";
import {
  getLocalePrimary,
  getLocalePrimaryWithFallback
} from "../../utils/locale";
import { requestWriteCalendarPermission } from "../../utils/permission";

type OwnProps = IOStackNavigationRouteProps<AppParamsList>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  LightModalContextInterface;

type PreferencesNavListItem = {
  value: string;
  condition?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

/**
 * Translates the primary languages of the provided locales.
 *
 * If a locale is not in the XX-YY format, it will be skipped.
 * If the primary language of a locale doesn't have a translation,
 * it gets returned verbatim.
 */
function translateLocale(locale: string): string {
  return pipe(
    getLocalePrimary(locale),
    O.map(l => I18n.t(`locales.${l}`, { defaultValue: l })),
    O.getOrElse(() => locale)
  );
}

const getServicesPreferenceModeLabel = (
  mode: ServicesPreferencesModeEnum
): string =>
  ({
    [ServicesPreferencesModeEnum.AUTO]: I18n.t(
      "services.optIn.preferences.quickConfig.value"
    ),
    [ServicesPreferencesModeEnum.MANUAL]: I18n.t(
      "services.optIn.preferences.manualConfig.value"
    ),
    [ServicesPreferencesModeEnum.LEGACY]: I18n.t(
      "services.optIn.preferences.unavailable"
    )
  }[mode]);

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

class PreferencesScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private checkPermissionThenGoCalendar = async () => {
    await requestWriteCalendarPermission({
      title: I18n.t("permissionRationale.calendar.title"),
      message: I18n.t("permissionRationale.calendar.message"),
      buttonPositive: I18n.t("global.buttons.choose")
    });

    void checkAndRequestPermission()
      .then(calendarPermission => {
        if (calendarPermission.authorized) {
          this.props.navigateToCalendarPreferenceScreen();
        } else if (!calendarPermission.asked) {
          // Authorized is false (denied, restricted or undetermined)
          // If the user denied permission previously (not in this session)
          // prompt an alert to inform that his calendar permissions could have been turned off
          Alert.alert(
            I18n.t("global.genericAlert"),
            I18n.t("messages.cta.calendarPermDenied.title"),
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

  private getEmailForwardPreferencesSubtitle = (): string => {
    if (!this.props.isInboxEnabled || !this.props.isEmailEnabled) {
      return I18n.t("send_email_messages.options.disable_all.label");
    }
    return pot.getOrElse(
      pot.map(this.props.isCustomEmailChannelEnabled, enabled =>
        enabled
          ? I18n.t("send_email_messages.options.by_service.label")
          : I18n.t("send_email_messages.options.enable_all.label")
      ),
      I18n.t("send_email_messages.options.enable_all.label")
    );
  };

  public render() {
    const { navigation, preferredCalendar } = this.props;

    const language = pipe(
      this.props.preferredLanguage,
      O.fold(
        () => translateLocale(getLocalePrimaryWithFallback()),
        l => translateLocale(l)
      )
    );

    const preferencesNavListItems: ReadonlyArray<PreferencesNavListItem> = [
      {
        // Notifications
        condition: remindersOptInEnabled,
        value: I18n.t("profile.preferences.list.notifications.title"),
        description: I18n.t("profile.preferences.list.notifications.subtitle"),
        onPress: () => {
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS
          });
        }
      },
      {
        // Calendar
        value: I18n.t("profile.preferences.list.preferred_calendar.title"),
        description: preferredCalendar
          ? convertLocalCalendarName(preferredCalendar.title)
          : I18n.t("profile.preferences.list.preferred_calendar.not_selected"),
        onPress: this.checkPermissionThenGoCalendar
      },
      {
        // Service Contacts
        value: I18n.t("profile.preferences.list.service_contact"),
        description: getServicesPreferenceModeLabel(
          this.props.profileServicePreferenceMode ??
            ServicesPreferencesModeEnum.LEGACY
        ),
        onPress: this.props.navigateToServiceContactPreferenceScreen
      },
      {
        // Email forwarding
        value: I18n.t("send_email_messages.title"),
        description: this.getEmailForwardPreferencesSubtitle(),
        onPress: this.props.navigateToEmailForwardingPreferenceScreen
      },
      {
        // Language
        value: I18n.t("profile.preferences.list.language"),
        description: language,
        onPress: this.props.navigateToLanguagePreferenceScreen
      }
    ];

    const renderPreferencesNavItem = ({
      item: { value, description, onPress, testID, condition }
    }: ListRenderItemInfo<PreferencesNavListItem>) => {
      // If condition is either true or undefined, render the item
      if (condition !== false) {
        return (
          <ListItemNav
            accessibilityLabel={value}
            value={value}
            description={description}
            onPress={onPress}
            testID={testID}
          />
        );
      } else {
        return null;
      }
    };

    // Don't render the separator, even if the item is null
    const filteredPreferencesNavListItems = preferencesNavListItems.filter(
      item => item.condition !== false
    );

    return (
      <RNavScreenWithLargeHeader
        title={I18n.t("profile.preferences.title")}
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
      </RNavScreenWithLargeHeader>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    preferredLanguage: preferredLanguageSelector(state),
    profileServicePreferenceMode: profileServicePreferencesModeSelector(state),
    isEmailEnabled: isEmailEnabledSelector(state),
    isInboxEnabled: isInboxEnabledSelector(state),
    isCustomEmailChannelEnabled: isCustomEmailChannelEnabledSelector(state),
    preferredCalendar: state.persistedPreferences.preferredCalendar
  };
}

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToServiceContactPreferenceScreen: () =>
    navigateToServicePreferenceScreen(),
  navigateToEmailForwardingPreferenceScreen: () =>
    navigateToEmailForwardingPreferenceScreen(),
  navigateToCalendarPreferenceScreen: () =>
    navigateToCalendarPreferenceScreen(),
  navigateToLanguagePreferenceScreen: () => navigateToLanguagePreferenceScreen()
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PreferencesScreen));
