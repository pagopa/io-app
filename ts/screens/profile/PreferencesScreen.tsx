/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { isEmailEditingAndValidationEnabled } from "../../config";
import I18n from "../../i18n";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailForwardingPreferenceScreen,
  navigateToEmailReadScreen,
  navigateToFingerprintPreferenceScreen
} from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { checkCalendarPermission } from "../../utils/calendar";
import { getLocalePrimary } from "../../utils/locale";

const unavailableAlert = () =>
  Alert.alert(
    I18n.t("profile.preferences.unavailable.title"),
    I18n.t("profile.preferences.unavailable.message")
  );

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
  hasCalendarPermission: boolean;
  checkCalendarPermissionAndUpdateStateSubscription?: ReturnType<
    NavigationScreenProp<NavigationState>["addListener"]
  >;
};

const INITIAL_STATE: State = {
  isFingerprintAvailable: false,
  hasCalendarPermission: false
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

    this.setState({
      checkCalendarPermissionAndUpdateStateSubscription: this.props.navigation.addListener(
        "willFocus",
        this.checkCalendarPermissionAndUpdateState
      )
    });
  }

  public componentWillUnmount() {
    if (
      this.state.checkCalendarPermissionAndUpdateStateSubscription !== undefined
    ) {
      this.state.checkCalendarPermissionAndUpdateStateSubscription.remove();
    }
  }

  private checkCalendarPermissionAndUpdateState = () => {
    checkCalendarPermission().then(
      hasPermission =>
        this.setState({
          hasCalendarPermission: hasPermission
        }),
      _ => undefined
    );
  };

  public render() {
    const { potProfile } = this.props;
    const { hasCalendarPermission, isFingerprintAvailable } = this.state;

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
            {hasCalendarPermission && (
              <ListItemComponent
                onPress={this.props.navigateToCalendarPreferenceScreen}
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
            )}

            <ListItemComponent
              title={I18n.t("profile.preferences.list.email")}
              subTitle={profileData.spid_email}
              onPress={this.handleEmailOnPress}
            />

            <ListItemComponent
              title={I18n.t(
                "profile.preferences.list.send_email_messages.title"
              )}
              subTitle={I18n.t(
                "profile.preferences.list.send_email_messages.subtitle"
              )}
              onPress={this.props.navigateToEmailForwardingPreferenceScreen}
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
  navigateToEmailForwardingPreferenceScreen: () =>
    dispatch(navigateToEmailForwardingPreferenceScreen()),
  navigateToCalendarPreferenceScreen: () =>
    dispatch(navigateToCalendarPreferenceScreen()),
  navigateToEmailInsertScreen: () =>
    dispatch(navigateToEmailReadScreen({ isFromProfileSection: true }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreferencesScreen);
