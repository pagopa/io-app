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
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import ExperimentalFeaturesBanner from "../../components/ExperimentalFeaturesBanner";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SelectLogoutOption from "../../components/SelectLogoutOption";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
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
import variables from "../../theme/variables";
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

  title: {
    fontWeight: "700"
  },

  listItem: {
    paddingTop: variables.spacerLargeHeight,
    paddingBottom: variables.spacerLargeHeight
  },

  noBorder: {
    borderBottomWidth: 0
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

/**
 * A component to show the main screen of the Profile section
 */
class ProfileMainScreen extends React.PureComponent<Props> {
  private handleClearCachePress = () => {
    this.props.clearCache();
    Toast.show({ text: "The cache has been cleared." });
  };

  private logout = (logoutOption: LogoutOption) => {
    this.props.logout(logoutOption);

    this.props.hideModal();
  };

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
      notificationId,
      isExperimentalFeaturesEnabled
    } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        appLogo={true}
      >
        <ScreenContentHeader
          title={I18n.t("profile.main.screenTitle")}
          icon={require("../../../img/icons/gears.png")}
          subtitle={I18n.t("profile.main.screenSubtitle")}
          banner={
            isExperimentalFeaturesEnabled
              ? ExperimentalFeaturesBanner
              : undefined
          }
        />

        <ScrollView ref={this.ServiceListRef}>
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

            <ListItem style={styles.noRightPadding}>
              <View style={styles.developerSectionItem}>
                <Text>
                  {I18n.t("profile.main.experimentalFeatures.confirmTitle")}
                </Text>
                <Switch
                  value={this.props.isExperimentalFeaturesEnabled}
                  onValueChange={this.onExperimentalFeaturesToggle}
                />
              </View>
            </ListItem>

            <ListItem style={styles.noRightPadding}>
              <View style={styles.developerSectionItem}>
                <View style={styles.developerSectionItemLeft}>
                  <Text style={styles.itemLeftText}>
                    {I18n.t("profile.main.pagoPaEnv")}
                  </Text>

                  <Text style={styles.itemLeftText}>
                    {I18n.t("profile.main.pagoPAEnvAlert")}
                  </Text>
                </View>
                <View style={styles.developerSectionItemRight}>
                  <Switch
                    value={this.props.isPagoPATestEnabled}
                    onValueChange={this.onPagoPAEnvironmentToggle}
                  />
                </View>
              </View>
            </ListItem>

            <ListItem style={styles.noRightPadding}>
              <View style={styles.developerSectionItem}>
                <Text>{I18n.t("profile.main.debugMode")}</Text>
                <Switch
                  value={this.props.isDebugModeEnabled}
                  onValueChange={this.props.setDebugModeEnabled}
                />
              </View>
            </ListItem>

            {this.props.isDebugModeEnabled && (
              <React.Fragment>
                <ListItem style={styles.noRightPadding}>
                  <Button
                    info={true}
                    small={true}
                    onPress={() =>
                      clipboardSetStringWithFeedback(getAppLongVersion())
                    }
                  >
                    <Text>
                      {`${I18n.t(
                        "profile.main.appVersion"
                      )} ${getAppLongVersion()}`}
                    </Text>
                  </Button>
                </ListItem>
                {backendInfo && (
                  <ListItem style={styles.noRightPadding}>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(backendInfo.version)
                      }
                    >
                      <Text>
                        {`${I18n.t("profile.main.backendVersion")} ${
                          backendInfo.version
                        }`}
                      </Text>
                    </Button>
                  </ListItem>
                )}
                {sessionToken && (
                  <ListItem style={styles.noRightPadding}>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(sessionToken)
                      }
                    >
                      <Text ellipsizeMode="tail" numberOfLines={1}>
                        {`Session Token ${sessionToken}`}
                      </Text>
                    </Button>
                  </ListItem>
                )}
                {walletToken && (
                  <ListItem style={styles.noRightPadding}>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(walletToken)
                      }
                    >
                      <Text ellipsizeMode="tail" numberOfLines={1}>
                        {`Wallet token ${walletToken}`}
                      </Text>
                    </Button>
                  </ListItem>
                )}

                <ListItem style={styles.noRightPadding}>
                  <Button
                    info={true}
                    small={true}
                    onPress={() =>
                      clipboardSetStringWithFeedback(notificationId)
                    }
                  >
                    <Text>{`Notification ID ${notificationId.slice(
                      0,
                      6
                    )}`}</Text>
                  </Button>
                </ListItem>

                {notificationToken && (
                  <ListItem style={styles.noRightPadding}>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(notificationToken)
                      }
                    >
                      <Text>{`Notification token ${notificationToken.slice(
                        0,
                        6
                      )}`}</Text>
                    </Button>
                  </ListItem>
                )}

                <ListItem style={styles.noRightPadding}>
                  <Button
                    danger={true}
                    small={true}
                    onPress={this.handleClearCachePress}
                  >
                    <Text>{I18n.t("profile.main.clearCache")}</Text>
                  </Button>
                </ListItem>

                <ListItem style={styles.noRightPadding}>
                  <Button
                    danger={true}
                    small={true}
                    onPress={this.props.dispatchSessionExpired}
                  >
                    <Text>{I18n.t("profile.main.forgetCurrentSession")}</Text>
                  </Button>
                </ListItem>
              </React.Fragment>
            )}
          </List>
        </ScrollView>
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
