import { fromNullable } from "fp-ts/lib/Option";
import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { TranslationKeys } from "../../../locales/locales";
import { ContextualHelp } from "../../components/ContextualHelp";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import { isEmailEditingAndValidationEnabled } from "../../config";
import I18n from "../../i18n";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailReadScreen,
  navigateToFingerprintPreferenceScreen
} from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { openAppSettings } from "../../utils/appSettings";
import { checkAndRequestPermission } from "../../utils/calendar";
import { getLocalePrimary } from "../../utils/locale";

const unavailableAlert = () =>
  Alert.alert(
    I18n.t("profile.preferences.unavailable.title"),
    I18n.t("profile.preferences.unavailable.message")
  );

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  LightModalContextInterface;

type State = {
  isFingerprintAvailable: boolean;
};

const INITIAL_STATE: State = {
  isFingerprintAvailable: false
};

const contextualHelp = {
  title: I18n.t("profile.preferences.contextualHelpTitle"),
  body: () => (
    <Markdown>{I18n.t("profile.preferences.contextualHelpContent")}</Markdown>
  )
};

/**
 * Translates the primary languages of the provided locales.
 *
 * If a locale is not in the XX-YY format, it will be skipped.
 * If the primary language of a locale doesn't have a translation,
 * it gets returned verbatim.
 */
function translateLocale(locale: string): string {
  return getLocalePrimary(locale)
    .map(l => I18n.t(`locales.${l}`, { defaultValue: l }))
    .getOrElse(locale);
}

/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
class PreferencesScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
    this.handleEmailOnPress = this.handleEmailOnPress.bind(this);
  }

  private handleEmailOnPress() {
    if (isEmailEditingAndValidationEnabled) {
      if (this.props.isEmailValidated) {
        this.props.navigateToEmailInsertScreen();
      } else {
        // TODO: add navigation to the dedicated screen
        //  https://www.pivotaltracker.com/story/show/168247501
      }
    } else {
      unavailableAlert();
    }
  }

  public componentWillMount() {
    getFingerprintSettings().then(
      biometryTypeOrUnsupportedReason => {
        this.setState({
          isFingerprintAvailable:
            biometryTypeOrUnsupportedReason !== "UNAVAILABLE" &&
            biometryTypeOrUnsupportedReason !== "NOT_ENROLLED"
        });
      },
      _ => undefined
    );
  }

  private checkPermissionThenGoCalendar = () => {
    checkAndRequestPermission()
      .then(calendarPermission => {
        if (calendarPermission.authorized) {
          this.props.navigateToCalendarPreferenceScreen();
        } else if (!calendarPermission.asked) {
          // Authorized is false (denied, restricted or undetermined)
          // If the user denied permission previously (not in this session)
          // prompt an alert to inform that his calendar permissions could have been turned off
          Alert.alert(
            I18n.t("messages.cta.calendarPermDenied.title"),
            undefined,
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

  public render() {
    const { potProfile } = this.props;
    const { isFingerprintAvailable } = this.state;

    const profileData = potProfile
      .map(_ => ({
        spid_email: untag(_.spid_email),
        spid_mobile_phone: untag(_.spid_mobile_phone)
      }))
      .getOrElse({
        spid_email: I18n.t("global.remoteStates.notAvailable"),
        spid_mobile_phone: I18n.t("global.remoteStates.notAvailable")
      });

    const languages = this.props.languages
      .filter(_ => _.length > 0)
      .map(_ => translateLocale(_[0]))
      .getOrElse(I18n.t("global.remoteStates.notAvailable"));

    const showModal = (title: TranslationKeys, body: TranslationKeys) => {
      this.props.showModal(
        <ContextualHelp
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    return (
      <TopScreenComponent
        contextualHelp={contextualHelp}
        title={I18n.t("profile.preferences.title")}
        goBack={() => this.props.navigation.goBack()}
      >
        <ScreenContent
          title={I18n.t("profile.preferences.title")}
          subtitle={I18n.t("profile.preferences.subtitle")}
          icon={require("../../../img/icons/gears.png")}
        >
          <List withContentLateralPadding={true}>
            {isFingerprintAvailable && (
              <ListItemComponent
                title={I18n.t("profile.preferences.list.biometric_recognition")}
                onPress={this.props.navigateToFingerprintPreferenceScreen}
                subTitle={
                  this.props.isFingerprintEnabled
                    ? I18n.t(
                        "profile.preferences.list.biometric_recognition_status.enabled"
                      )
                    : I18n.t(
                        "profile.preferences.list.biometric_recognition_status.disabled"
                      )
                }
              />
            )}
            <ListItemComponent
              onPress={this.checkPermissionThenGoCalendar}
              title={I18n.t(
                "profile.preferences.list.preferred_calendar.title"
              )}
              subTitle={
                this.props.preferredCalendar
                  ? this.props.preferredCalendar.title
                  : I18n.t(
                      "profile.preferences.list.preferred_calendar.not_selected"
                    )
              }
            />

            <ListItemComponent
              title={I18n.t("profile.preferences.list.email")}
              subTitle={profileData.spid_email}
              iconName={"io-email"}
              onPress={this.handleEmailOnPress}
              titleBadge={
                isEmailEditingAndValidationEnabled
                  ? I18n.t("profile.preferences.list.need_validate")
                  : undefined
              }
            />

            <ListItemComponent
              title={I18n.t("profile.preferences.list.mobile_phone")}
              subTitle={profileData.spid_mobile_phone}
              iconName={"io-phone-number"}
              onPress={unavailableAlert}
            />

            <ListItemComponent
              title={I18n.t("profile.preferences.list.language")}
              subTitle={languages}
              iconName={"io-languages"}
              onPress={() =>
                showModal(
                  "profile.preferences.language.contextualHelpTitle",
                  "profile.preferences.language.contextualHelpContent"
                )
              }
            />

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  // TODO: get info on validation from profile
  //      https://www.pivotaltracker.com/story/show/168662501
  const isEmailValidated = true;
  return {
    languages: fromNullable(state.preferences.languages),
    potProfile: pot.toOption(profileSelector(state)),
    isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
    preferredCalendar: state.persistedPreferences.preferredCalendar,
    isEmailValidated
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToFingerprintPreferenceScreen: () =>
    dispatch(navigateToFingerprintPreferenceScreen()),
  navigateToCalendarPreferenceScreen: () =>
    dispatch(navigateToCalendarPreferenceScreen()),
  navigateToEmailInsertScreen: () =>
    dispatch(navigateToEmailReadScreen({ isFromProfileSection: true }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PreferencesScreen));
