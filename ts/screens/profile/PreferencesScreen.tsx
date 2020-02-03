import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen,
  navigateToFingerprintPreferenceScreen
} from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import {
  hasProfileEmailSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileSelector,
  profileSpidEmailSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { openAppSettings } from "../../utils/appSettings";
import { checkAndRequestPermission } from "../../utils/calendar";
import { getLocalePrimary } from "../../utils/locale";

const languageAlert = () =>
  Alert.alert(
    I18n.t("profile.preferences.language.title"),
    I18n.t("profile.preferences.language.message")
  );

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps;

type State = {
  isFingerprintAvailable: boolean;
};

const INITIAL_STATE: State = {
  isFingerprintAvailable: false
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
    if (this.props.hasProfileEmail) {
      this.props.navigateToEmailReadScreen();
      return;
    }
    this.props.navigateToEmailInsertScreen();
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
    const { isFingerprintAvailable } = this.state;

    const notAvailable = I18n.t("global.remoteStates.notAvailable");
    const maybeEmail = this.props.optionEmail;
    const maybeSpidEmail = this.props.optionSpidEmail;

    const languages = this.props.languages
      .filter(_ => _.length > 0)
      .map(_ => translateLocale(_[0]))
      .getOrElse(I18n.t("global.remoteStates.notAvailable"));

    return (
      <TopScreenComponent
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
              subTitle={maybeEmail.getOrElse(notAvailable)}
              titleBadge={
                this.props.isEmailValidated === false
                  ? I18n.t("profile.preferences.list.need_validate")
                  : undefined
              }
              onPress={this.handleEmailOnPress}
            />

            {// Check if spid email exists
            maybeSpidEmail.isSome() && (
              <ListItemComponent
                title={I18n.t("profile.preferences.list.spid_email")}
                subTitle={maybeSpidEmail.value}
              />
            )}

            <ListItemComponent
              title={I18n.t("profile.preferences.list.language")}
              subTitle={languages}
              iconName={"io-languages"}
              onPress={languageAlert}
            />

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    languages: fromNullable(state.preferences.languages),
    potProfile: pot.toOption(profileSelector(state)),
    optionEmail: profileEmailSelector(state),
    optionSpidEmail: profileSpidEmailSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
    preferredCalendar: state.persistedPreferences.preferredCalendar,
    hasProfileEmail: hasProfileEmailSelector(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToFingerprintPreferenceScreen: () =>
    dispatch(navigateToFingerprintPreferenceScreen()),
  navigateToCalendarPreferenceScreen: () =>
    dispatch(navigateToCalendarPreferenceScreen()),
  navigateToEmailReadScreen: () => dispatch(navigateToEmailReadScreen()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreferencesScreen);
