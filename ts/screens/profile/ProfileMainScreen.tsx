import { Millisecond } from "italia-ts-commons/lib/units";
import { List, ListItem, Text, Toast, View } from "native-base";
import * as React from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { TranslationKeys } from "../../../locales/locales";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { ContextualHelp } from "../../components/ContextualHelp";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import Switch from "../../components/ui/Switch";
import { isPlaygroundsEnabled, shufflePinPadOnPayment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { identificationRequest } from "../../store/actions/identification";
import {
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { updatePin } from "../../store/actions/pinset";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { getAppVersion } from "../../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { isDevEnv } from "../../utils/environment";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  tapsOnAppVersion: number;
};

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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

/**
 * A screen to show all the options related to the user profile
 */
class ProfileMainScreen extends React.PureComponent<Props, State> {
  private navListener?: NavigationEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      tapsOnAppVersion: 0
    };
    this.handleClearCachePress = this.handleClearCachePress.bind(this);
  }

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
    }); // eslint-disable-line
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
    // This ensures modals will be closed (if there are some opened)
    this.props.hideModal();
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
  }

  private handleClearCachePress() {
    Alert.alert(
      I18n.t("profile.main.cache.alert"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            this.props.clearCache();
            Toast.show({ text: I18n.t("profile.main.cache.cleared") });
          }
        }
      ],
      { cancelable: false }
    );
  }

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
        <ButtonDefaultOpacity
          primary={true}
          danger={isDanger}
          small={true}
          onPress={onPress}
        >
          <Text numberOfLines={1}>{title}</Text>
        </ButtonDefaultOpacity>
      </ListItem>
    );
  }

  private versionListItem(title: string, onPress: () => void) {
    return (
      <ListItem style={styles.noRightPadding}>
        <Text numberOfLines={1} semibold={true} onPress={onPress}>
          {title}
        </Text>
      </ListItem>
    );
  }

  private onLogoutPress = () => {
    Alert.alert(
      I18n.t("profile.logout.menulabel"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: this.props.logout
        }
      ],
      { cancelable: true }
    );
  };

  private showModal() {
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }

  private onPagoPAEnvironmentToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmTitle"),
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "destructive",
            onPress: () => {
              this.props.setPagoPATestEnabled(enabled);
              this.showModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.props.setPagoPATestEnabled(enabled);
      this.showModal();
    }
  };

  private idResetTap?: number;

  // When tapped 5 time activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  private onTapAppVersion = () => {
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
    // do nothing
    if (this.props.isDebugModeEnabled || isDevEnv) {
      return;
    }
    if (this.state.tapsOnAppVersion === consecutiveTapRequired) {
      this.props.setDebugModeEnabled(true);
      this.setState({ tapsOnAppVersion: 0 });
      Toast.show({ text: I18n.t("profile.main.developerModeOn") });
    } else {
      // eslint-disable-next-line
      this.idResetTap = setInterval(
        this.resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      const tapsOnAppVersion = this.state.tapsOnAppVersion + 1;
      this.setState({
        tapsOnAppVersion
      });
    }
  };

  private resetAppTapCounter = () => {
    this.setState({ tapsOnAppVersion: 0 });
    clearInterval(this.idResetTap);
  };

  private ServiceListRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.ServiceListRef.current) {
      this.ServiceListRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  };

  // eslint-disable-next-line
  public render() {
    const {
      navigation,
      backendInfo,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId
    } = this.props;

    const showInformationModal = (
      title: TranslationKeys,
      body: TranslationKeys
    ) => {
      this.props.showModal(
        <ContextualHelp
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    // eslint-disable
    const screenContent = () => (
      <ScrollView ref={this.ServiceListRef} style={styles.whiteBg}>
        <NavigationEvents onWillFocus={this.scrollToTop} />
        <View spacer={true} />
        <List withContentLateralPadding={true}>
          {/* Preferences */}
          <ListItemComponent
            title={I18n.t("profile.main.preferences.title")}
            subTitle={I18n.t("profile.main.preferences.description")}
            onPress={() => navigation.navigate(ROUTES.PROFILE_PREFERENCES_HOME)}
            isFirstItem={true}
          />

          {/* Privacy */}
          <ListItemComponent
            title={I18n.t("profile.main.privacy.title")}
            subTitle={I18n.t("profile.main.privacy.description")}
            onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
          />

          {/* APP IO */}
          <ListItemComponent
            title={I18n.t("profile.main.appInfo.title")}
            subTitle={I18n.t("profile.main.appInfo.description")}
            onPress={() =>
              showInformationModal(
                "profile.main.appInfo.title",
                "profile.main.appInfo.contextualHelpContent"
              )
            }
            isLastItem={true}
          />

          <SectionHeaderComponent
            sectionHeader={I18n.t("profile.main.accountSectionHeader")}
          />

          {/* Ask for verification and reset unlock code */}
          <ListItemComponent
            title={I18n.t("identification.unlockCode.reset.button_short")}
            subTitle={I18n.t("identification.unlockCode.reset.subtitle")}
            onPress={this.props.requestIdentificationAndResetPin}
            hideIcon={true}
          />

          {/* Logout/Exit */}
          <ListItemComponent
            title={I18n.t("profile.main.logout")}
            subTitle={I18n.t("profile.logout.menulabel")}
            onPress={this.onLogoutPress}
            hideIcon={true}
            isLastItem={true}
          />

          {this.versionListItem(
            `${I18n.t("profile.main.appVersion")} ${getAppVersion()}`,
            this.onTapAppVersion
          )}

          {/* Developers Section */}
          {(this.props.isDebugModeEnabled || isDevEnv) && (
            <React.Fragment>
              <SectionHeaderComponent
                sectionHeader={I18n.t("profile.main.developersSectionHeader")}
              />

              {
                // since no experimental features are available we avoid to render this item (see https://www.pivotaltracker.com/story/show/168263994).
                // It could be useful when new experimental features will be available
                /*
                  this.developerListItem(
                  I18n.t("profile.main.experimentalFeatures.confirmTitle"),
                  this.props.isExperimentalFeaturesEnabled,
                  this.onExperimentalFeaturesToggle
                ) */
              }
              {isPlaygroundsEnabled && (
                <>
                  <ListItemComponent
                    title={"MyPortal Web Playground"}
                    onPress={() => navigation.navigate(ROUTES.WEB_PLAYGROUND)}
                  />
                  <ListItemComponent
                    title={"Markdown Playground"}
                    onPress={() =>
                      navigation.navigate(ROUTES.MARKDOWN_PLAYGROUND)
                    }
                  />
                </>
              )}
              {/* Showroom */}
              <ListItemComponent
                title={I18n.t("profile.main.showroom")}
                onPress={() => navigation.navigate(ROUTES.SHOWROOM)}
                isFirstItem={true}
              />
              {this.developerListItem(
                I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
                this.props.isPagoPATestEnabled,
                this.onPagoPAEnvironmentToggle,
                I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")
              )}
              {this.developerListItem(
                I18n.t("profile.main.debugMode"),
                this.props.isDebugModeEnabled,
                this.props.setDebugModeEnabled
              )}
              {this.props.isDebugModeEnabled && (
                <React.Fragment>
                  {backendInfo &&
                    this.debugListItem(
                      `${I18n.t("profile.main.backendVersion")} ${
                        backendInfo.version
                      }`,
                      () => clipboardSetStringWithFeedback(backendInfo.version),
                      false
                    )}

                  {isDevEnv &&
                    sessionToken &&
                    this.debugListItem(
                      `Session Token ${sessionToken}`,
                      () => clipboardSetStringWithFeedback(sessionToken),
                      false
                    )}

                  {isDevEnv &&
                    walletToken &&
                    this.debugListItem(
                      `Wallet token ${walletToken}`,
                      () => clipboardSetStringWithFeedback(walletToken),
                      false
                    )}

                  {isDevEnv &&
                    this.debugListItem(
                      `Notification ID ${notificationId.slice(0, 6)}`,
                      () => clipboardSetStringWithFeedback(notificationId),
                      false
                    )}

                  {isDevEnv &&
                    notificationToken &&
                    this.debugListItem(
                      `Notification token ${notificationToken.slice(0, 6)}`,
                      () => clipboardSetStringWithFeedback(notificationToken),
                      false
                    )}

                  {this.debugListItem(
                    I18n.t("profile.main.cache.clear"),
                    this.handleClearCachePress,
                    true
                  )}

                  {isDevEnv &&
                    this.debugListItem(
                      I18n.t("profile.main.forgetCurrentSession"),
                      this.props.dispatchSessionExpired,
                      true
                    )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}

          {/* end list */}
          <EdgeBorderComponent />
        </List>
      </ScrollView>
    );

    return (
      <DarkLayout
        accessibilityLabel={I18n.t("profile.main.title")}
        bounces={false}
        appLogo={true}
        title={I18n.t("profile.main.title")}
        icon={require("../../../img/icons/profile-illustration.png")}
        topContent={
          <TouchableDefaultOpacity
            accessibilityRole={"button"}
            onPress={() =>
              this.props.navigation.navigate(ROUTES.PROFILE_FISCAL_CODE)
            }
          >
            <FiscalCodeComponent type={"Preview"} />
          </TouchableDefaultOpacity>
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["profile"]}
      >
        {screenContent()}
      </DarkLayout>
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
  isDebugModeEnabled: isDebugModeEnabledSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest({ keepUserData: false })),
  requestIdentificationAndResetPin: () => {
    const onSuccess = () => dispatch(updatePin());

    return dispatch(
      identificationRequest(
        true,
        false,
        undefined,
        undefined,
        {
          onSuccess
        },
        shufflePinPadOnPayment
      )
    );
  },
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ProfileMainScreen));
