/**
 * A component to show the main screen of the Profile section
 */
import {
  Button,
  H3,
  List,
  ListItem,
  Switch,
  Text,
  Toast,
  View
} from "native-base";
import * as React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import ExperimentalFeaturesBanner from "../../components/ExperimentalFeaturesBanner";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import DarkLayout from "../../components/screens/DarkLayout";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SelectLogoutOption from "../../components/SelectLogoutOption";
import { AlertModal } from "../../components/ui/AlertModal";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  LogoutOption,
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import {
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { startPinReset } from "../../store/actions/pinset";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  developerSectionItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  developerSectionItemLeft: {
    flex: 1
  },
  developerSectionItemRight: {
    flex: 0
  },
  modalHeader: {
    lineHeight: 40
  },
  whiteBg: {
    backgroundColor: customVariables.colorWhite
  },

  noRightPadding: {
    paddingRight: 0
  }
});

const getAppLongVersion = () => {
  const buildNumber =
    Platform.OS === "ios" ? ` (${DeviceInfo.getBuildNumber()})` : "";
  return `${DeviceInfo.getVersion()}${buildNumber}`;
};

class ProfileMainScreen extends React.PureComponent<Props> {
  private handleClearCachePress = () => {
    this.props.clearCache();
    Toast.show({ text: "The cache has been cleared." });
  };

  private logout = (logoutOption: LogoutOption) => {
    this.props.logout(logoutOption);

    this.props.hideModal();
  };

  private developerListItem(
    title: string,
    switchValue: boolean,
    onSwitchValueChange: (value: boolean) => void,
    description?: string
  ) {
    return (
      <ListItem style={styles.noRightPadding}>
        <View style={styles.developerSectionItem}>
          <View style={styles.developerSectionItemLeft}>
            <Text style={styles.itemLeftText}>{title}</Text>

            <Text style={styles.itemLeftText}>{description}</Text>
          </View>
          <View style={styles.developerSectionItemRight}>
            <Switch value={switchValue} onValueChange={onSwitchValueChange} />
          </View>
        </View>
      </ListItem>
    );
  }

  private debugListItem(title: string, onPress: () => void, isDanger: boolean) {
    return (
      <ListItem style={styles.noRightPadding}>
        <Button
          info={!isDanger}
          danger={isDanger}
          small={true}
          onPress={onPress}
        >
          <Text numberOfLines={1}>{title}</Text>
        </Button>
      </ListItem>
    );
  }

  private onLogoutPress = () => {
    // Show a modal to let the user select a calendar
    this.props.showModal(
      <SelectLogoutOption
        onCancel={this.props.hideModal}
        onOptionSelected={this.logout}
        header={
          <View>
            <H3 style={styles.modalHeader}>
              {I18n.t("profile.logout.cta.header")}
            </H3>
            <View spacer={true} large={true} />
          </View>
        }
      />
    );
  };

  private onExperimentalFeaturesToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.experimentalFeatures.confirmTitle"),
        I18n.t("profile.main.experimentalFeatures.confirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.ok"),
            style: "destructive",
            onPress: () => {
              this.props.dispatchPreferencesExperimentalFeaturesSetEnabled(
                enabled
              );
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.props.dispatchPreferencesExperimentalFeaturesSetEnabled(enabled);
    }
  };

  private onPagoPAEnvironmentToggle = (enabled: boolean) => {
    this.props.setPagoPATestEnabled(enabled);
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  };

  private confirmResetAlert = () =>
    Alert.alert(
      I18n.t("profile.main.resetPin.confirmTitle"),
      I18n.t("profile.main.resetPin.confirmMsg"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: this.props.resetPin
        }
      ],
      { cancelable: false }
    );

  private ServiceListRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.ServiceListRef.current) {
      this.ServiceListRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  };

  // tslint:disable-next-line: no-big-function
  public render() {
    const {
      navigation,
      backendInfo,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId
    } = this.props;

    // TODO: once isExperimentalFeaturesEnabled is removed, shift again screenContent into the main return
    // tslint:disable no-big-function
    const screenContent = () => {
      return (
        <ScrollView ref={this.ServiceListRef} style={styles.whiteBg}>
          <NavigationEvents onWillFocus={this.scrollToTop} />
          <List withContentLateralPadding={true}>
            {/* Preferences */}
            <ListItemComponent
              title={I18n.t("profile.main.preferences.title")}
              subTitle={I18n.t("profile.main.preferences.description")}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_PREFERENCES_HOME)
              }
              isFirstItem={true}
            />

            {/* Privacy */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.title")}
              subTitle={I18n.t("profile.main.privacy.description")}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
              isLastItem={true}
            />

            <SectionHeaderComponent
              sectionHeader={I18n.t("profile.main.accountSectionHeader")}
            />

            {/* Reset PIN */}
            <ListItemComponent
              title={I18n.t("pin_login.pin.reset.button_short")}
              subTitle={I18n.t("pin_login.pin.reset.tip_short")}
              onPress={this.confirmResetAlert}
            />

            {/* Logout/Exit */}
            <ListItemComponent
              title={I18n.t("profile.main.logout")}
              subTitle={I18n.t("profile.logout.menulabel")}
              onPress={this.onLogoutPress}
              isLastItem={true}
            />

            <SectionHeaderComponent
              sectionHeader={I18n.t("profile.main.developersSectionHeader")}
            />

            {this.developerListItem(
              I18n.t("profile.main.experimentalFeatures.confirmTitle"),
              this.props.isExperimentalFeaturesEnabled,
              this.onExperimentalFeaturesToggle
            )}

            {this.developerListItem(
              I18n.t("profile.main.pagoPaEnv"),
              this.props.isPagoPATestEnabled,
              this.onPagoPAEnvironmentToggle,
              I18n.t("profile.main.pagoPAEnvAlert")
            )}

            {this.developerListItem(
              I18n.t("profile.main.debugMode"),
              this.props.isDebugModeEnabled,
              this.props.setDebugModeEnabled
            )}

            {this.props.isDebugModeEnabled && (
              <React.Fragment>
                {this.debugListItem(
                  `${I18n.t("profile.main.appVersion")} ${getAppLongVersion()}`,
                  () => clipboardSetStringWithFeedback(getAppLongVersion()),
                  false
                )}

                {backendInfo &&
                  this.debugListItem(
                    `${I18n.t("profile.main.backendVersion")} ${
                      backendInfo.version
                    }`,
                    () => clipboardSetStringWithFeedback(backendInfo.version),
                    false
                  )}
                {sessionToken &&
                  this.debugListItem(
                    `Session Token ${sessionToken}`,
                    () => clipboardSetStringWithFeedback(sessionToken),
                    false
                  )}

                {walletToken &&
                  this.debugListItem(
                    `Wallet token ${walletToken}`,
                    () => clipboardSetStringWithFeedback(walletToken),
                    false
                  )}

                {this.debugListItem(
                  `Notification ID ${notificationId.slice(0, 6)}`,
                  () => clipboardSetStringWithFeedback(notificationId),
                  false
                )}

                {notificationToken &&
                  this.debugListItem(
                    `Notification token ${notificationToken.slice(0, 6)}`,
                    () => clipboardSetStringWithFeedback(notificationToken),
                    false
                  )}

                {this.debugListItem(
                  I18n.t("profile.main.clearCache"),
                  this.handleClearCachePress,
                  true
                )}

                {this.debugListItem(
                  I18n.t("profile.main.forgetCurrentSession"),
                  this.props.dispatchSessionExpired,
                  true
                )}
              </React.Fragment>
            )}
          </List>
        </ScrollView>
      );
    };

    return this.props.isExperimentalFeaturesEnabled ? (
      <DarkLayout
        allowGoBack={false}
        bounces={false}
        headerBody={<IconFont name="io-logo" color={"white"} />}
        title={I18n.t("profile.main.screenTitle")}
        icon={require("../../../img/icons/profile-illustration.png")}
        topContent={
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate(ROUTES.PROFILE_FISCAL_CODE)
            }
          >
            <FiscalCodeComponent type={"Preview"} />
          </TouchableOpacity>
        }
        contextualHelp={{
          title: I18n.t("profile.main.screenTitle"),
          body: () => (
            <Markdown>{I18n.t("profile.main.contextualHelp")}</Markdown>
          )
        }}
        banner={ExperimentalFeaturesBanner}
      >
        {screenContent()}
      </DarkLayout>
    ) : (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        appLogo={true}
      >
        <ScreenContentHeader
          title={I18n.t("profile.main.screenTitle")}
          icon={require("../../../img/icons/gears.png")}
          subtitle={I18n.t("profile.main.screenSubtitle")}
        />
        {screenContent()}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  backendInfo: state.backendInfo.serverInfo,
  sessionToken: isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined,
  walletToken: isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined,
  notificationId: notificationsInstallationSelector(state).id,
  notificationToken: notificationsInstallationSelector(state).token,
  isDebugModeEnabled: state.debug.isDebugModeEnabled,
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetPin: () => dispatch(startPinReset()),
  logout: (logoutOption: LogoutOption) => dispatch(logoutRequest(logoutOption)),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ProfileMainScreen));
