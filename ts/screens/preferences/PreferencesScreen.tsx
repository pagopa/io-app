import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, List, ListItem } from "native-base";
import * as React from "react";

import { Alert, StyleSheet } from "react-native";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable } from "fp-ts/lib/Option";

import { untag } from "italia-ts-commons/lib/types";

import I18n from "../../i18n";

import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import PreferenceItem from "../../components/PreferenceItem";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";

import ROUTES from "../../navigation/routes";

import { Calendar } from "react-native-calendar-events";
import { checkCalendarPermission } from "../../utils/calendar";

import { LightModalContextInterface } from "../../components/ui/LightModal";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import { getLocalePrimary } from "../../utils/locale";

import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";

import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import SelectCalendarModal from "../../components/SelectCalendarModal";
import { navigateToFingerprintPreferenceScreen } from "../../store/actions/navigation";

const unavailableAlert = () =>
  Alert.alert(
    I18n.t("preferences.unavailable.title"),
    I18n.t("preferences.unavailable.message")
  );

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps;

type State = {
  isFingerprintAvailable: boolean;
  hasCalendarPermission: boolean;
};

const INITIAL_STATE: State = {
  isFingerprintAvailable: false,
  hasCalendarPermission: false
};

const styles = StyleSheet.create({
  selectCalendaModalHeader: {
    marginBottom: 25
  }
});

const SelectCalendarModalHeader = (
  <H1 style={styles.selectCalendaModalHeader}>
    {I18n.t("messages.cta.preferenceCalendarSelect")}
  </H1>
);

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

    checkCalendarPermission().then(
      hasPermission =>
        this.setState({
          hasCalendarPermission: hasPermission
        }),
      _ => undefined
    );
  }

  private onCalendarSelected = (calendar: Calendar) => {
    this.props.hideModal();

    this.props.preferredCalendarSaveSuccess(calendar);
  };

  private onSelectCalendarCancel = () => {
    this.props.hideModal();
  };

  private renderDefaultCalendarPreference = () => {
    const { showModal } = this.props;
    // Show a modal to let the user select a calendar
    showModal(
      <SelectCalendarModal
        onCancel={this.onSelectCalendarCancel}
        onCalendarSelected={this.onCalendarSelected}
        header={SelectCalendarModalHeader}
      />
    );
  };

  public render() {
    const contextualHelp = {
      title: I18n.t("preferences.title"),
      body: () => <Markdown>{I18n.t("preferences.preferencesHelp")}</Markdown>
    };

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
        title={I18n.t("preferences.title")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("preferences.subtitle")}
        contextualHelp={contextualHelp}
      >
        <Content noPadded={true}>
          <List withContentLateralPadding={true}>
            <ListItem
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICES)
              }
            >
              <PreferenceItem
                kind="action"
                title={I18n.t("preferences.list.services")}
                valuePreview={I18n.t("preferences.list.services_description")}
              />
            </ListItem>
            {isFingerprintAvailable && (
              <ListItem
                onPress={() =>
                  this.props.navigateToFingerprintPreferenceScreen()
                }
              >
                <PreferenceItem
                  kind="action"
                  title={I18n.t("preferences.list.biometric_recognition")}
                  valuePreview={
                    this.props.isFingerprintEnabled
                      ? I18n.t(
                          "preferences.list.biometric_recognition_status.enabled"
                        )
                      : I18n.t(
                          "preferences.list.biometric_recognition_status.disabled"
                        )
                  }
                />
              </ListItem>
            )}
            {hasCalendarPermission && (
              <ListItem onPress={this.renderDefaultCalendarPreference}>
                <PreferenceItem
                  kind="action"
                  title={I18n.t("preferences.list.preferred_calendar.title")}
                  valuePreview={
                    this.props.preferredCalendar
                      ? this.props.preferredCalendar.title
                      : I18n.t(
                          "preferences.list.preferred_calendar.not_selected"
                        )
                  }
                />
              </ListItem>
            )}
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.email")}
                icon="io-email"
                valuePreview={profileData.spid_email}
              />
            </ListItem>
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.mobile_phone")}
                icon="io-phone-number"
                valuePreview={profileData.spid_mobile_phone}
              />
            </ListItem>
            <ListItem onPress={unavailableAlert}>
              <PreferenceItem
                kind="value"
                title={I18n.t("preferences.list.language")}
                icon="io-languages"
                valuePreview={languages}
              />
            </ListItem>
          </List>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  languages: fromNullable(state.preferences.languages),
  potProfile: pot.toOption(state.profile),
  isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
  preferredCalendar: state.persistedPreferences.preferredCalendar
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToFingerprintPreferenceScreen: () =>
    dispatch(navigateToFingerprintPreferenceScreen()),
  preferredCalendarSaveSuccess: (calendar: Calendar) =>
    dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PreferencesScreen));
