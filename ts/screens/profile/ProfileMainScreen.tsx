import {
  ButtonSolid,
  ContentWrapper,
  Divider,
  H2,
  IOColors,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfoCopy,
  ListItemNav,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "native-base";
import * as React from "react";
import { ComponentProps } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  View
} from "react-native";
import { connect } from "react-redux";
import { TranslationKeys } from "../../../locales/locales";
import AppVersion from "../../components/AppVersion";
import ContextualInfo from "../../components/ContextualInfo";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import {
  TabBarItemPressType,
  withUseTabItemPressWhenScreenActive
} from "../../components/helpers/withUseTabItemPressWhenScreenActive";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import { ScreenContentRoot } from "../../components/screens/ScreenContent";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import { isPlaygroundsEnabled } from "../../config";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import { toThumbprint } from "../../features/lollipop/utils/crypto";
import { walletAddCoBadgeStart } from "../../features/wallet/onboarding/cobadge/store/actions";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../navigation/params/MainTabParamsList";
import ROUTES from "../../navigation/routes";
import { sessionExpired } from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { navigateToLogout } from "../../store/actions/navigation";
import {
  preferencesIdPayTestSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferencesPnTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import {
  isIdPayTestEnabledSelector,
  isPagoPATestEnabledSelector,
  isPnTestEnabledSelector
} from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { getDeviceId } from "../../utils/device";
import { isDevEnv } from "../../utils/environment";
import DSEnableSwitch from "./components/DSEnableSwitch";

type Props = IOStackNavigationRouteProps<MainTabParamsList, "PROFILE_MAIN"> &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  TabBarItemPressType;

type State = {
  tapsOnAppVersion: number;
};

type ProfileNavListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress" | "hideChevron"
>;

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
  constructor(props: Props) {
    super(props);
    this.state = {
      tapsOnAppVersion: 0
    };
    this.handleClearCachePress = this.handleClearCachePress.bind(this);
  }

  public componentWillUnmount() {
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
      <ListItemSwitch
        label={title}
        description={description}
        value={switchValue}
        onSwitchValueChange={onSwitchValueChange}
      />
    );
  }

  private debugCopyListItem(label: string, value: string, onPress: () => void) {
    return (
      <>
        <ListItemInfoCopy
          label={label}
          value={value}
          onPress={onPress}
          accessibilityLabel={value}
          numberOfLines={5}
        />
        <Divider />
      </>
    );
  }

  private debugListItem(title: string, onPress: () => void, isDanger: boolean) {
    return (
      <View style={{ paddingVertical: 8 }}>
        {isDanger ? (
          <ButtonSolid
            fullWidth
            color="danger"
            label={title}
            onPress={onPress}
            accessibilityLabel={title}
          />
        ) : (
          <ButtonSolid
            fullWidth
            color="primary"
            label={title}
            onPress={onPress}
            accessibilityLabel={title}
          />
        )}
      </View>
    );
  }

  private onLogoutPress = () => {
    Alert.alert(
      I18n.t("profile.logout.alertTitle"),
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

  private onPnEnvironmentToggle = (enabled: boolean) => {
    this.props.setPnTestEnabled(enabled);
  };

  private onIdPayTestToggle = (enabled: boolean) => {
    this.props.setIdPayTestEnabled(enabled);
    this.showModal();
  };

  private onAddTestCard = () => {
    if (!this.props.isPagoPATestEnabled) {
      Alert.alert(
        I18n.t("profile.main.addCard.warning.title"),
        I18n.t("profile.main.addCard.warning.message"),
        [
          {
            text: I18n.t("profile.main.addCard.warning.closeButton"),
            style: "cancel"
          }
        ],
        { cancelable: false }
      );
      return;
    }
    this.props.startAddTestCard();
  };

  private idResetTap?: number;

  // When tapped 5 times activate the debug mode of the application.
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
      // eslint-disable-next-line functional/immutable-data
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

  private renderDeveloperSection() {
    const {
      dispatchSessionExpired,
      isDebugModeEnabled,
      isPagoPATestEnabled,
      isPnTestEnabled,
      navigation,
      notificationId,
      notificationToken,
      sessionToken,
      isFastLoginEnabled,
      walletToken,
      setDebugModeEnabled,
      isIdPayTestEnabled,
      publicKey
    } = this.props;
    const deviceUniqueId = getDeviceId();
    const thumbprint = toThumbprint(publicKey);

    return (
      <React.Fragment>
        <VSpacer size={24} />
        <H2>{I18n.t("profile.main.developersSectionHeader")}</H2>

        <VSpacer size={8} />
        {this.developerListItem(
          I18n.t("profile.main.debugMode"),
          isDebugModeEnabled,
          setDebugModeEnabled
        )}

        {isPlaygroundsEnabled && (
          <>
            <VSpacer size={8} />
            <ListItemHeader label="Playground" />
            <ListItemNav
              value={"Lollipop"}
              accessibilityLabel={"Lollipop"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.LOLLIPOP_PLAYGROUND
                })
              }
            />
            {/* We should use FlatList or FlashList to manage
            automatically the <Divider /> component */}
            <Divider />
            <ListItemNav
              value={"MyPortal Web"}
              accessibilityLabel={"MyPortal Web"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.WEB_PLAYGROUND
                })
              }
            />
            <Divider />
            <ListItemNav
              value={"Markdown"}
              accessibilityLabel={"Markdown"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.MARKDOWN_PLAYGROUND
                })
              }
            />
            <Divider />
            <ListItemNav
              value={"CGN Landing Page"}
              accessibilityLabel="CGN Landing Page"
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.CGN_LANDING_PLAYGROUND
                })
              }
            />
            {isIdPayTestEnabled && (
              <>
                <Divider />
                <ListItemNav
                  value={"IDPay Onboarding"}
                  accessibilityLabel="IDPay Onboarding Playground"
                  onPress={() =>
                    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                      screen: ROUTES.IDPAY_ONBOARDING_PLAYGROUND
                    })
                  }
                />
                <Divider />
                <ListItemNav
                  value={"IDPay Code"}
                  accessibilityLabel="IDPay CIE onboarding playground"
                  onPress={() =>
                    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                      screen: ROUTES.IDPAY_CODE_PLAYGROUND
                    })
                  }
                />
              </>
            )}
          </>
        )}
        <Divider />
        {/* New Wallet Playground */}
        <ListItemNav
          value={I18n.t("profile.main.walletPlayground.titleSection")}
          accessibilityLabel={I18n.t(
            "profile.main.walletPlayground.titleSection"
          )}
          onPress={() =>
            navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
              screen: ROUTES.WALLET_PLAYGROUND
            })
          }
        />

        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t("profile.main.testEnvironmentSectionHeader")}
        />

        {this.developerListItem(
          I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
          isPagoPATestEnabled,
          this.onPagoPAEnvironmentToggle,
          I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")
        )}
        <Divider />
        {/* Add Test Card CTA */}
        <ListItemNav
          value={I18n.t("profile.main.addCard.titleSection")}
          accessibilityLabel={I18n.t("profile.main.addCard.titleSection")}
          onPress={this.onAddTestCard}
        />
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.pnEnvironment.pnEnv"),
          isPnTestEnabled,
          this.onPnEnvironmentToggle
        )}
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.idpay.idpayTest"),
          isIdPayTestEnabled,
          this.onIdPayTestToggle,
          I18n.t("profile.main.idpay.idpayTestAlert")
        )}

        {/* —————————————————— */}

        {/* Human Interface/Design System */}
        <VSpacer size={24} />
        <ListItemHeader label="Human Interface" />

        <ListItemNav
          value={I18n.t("profile.main.designSystem")}
          accessibilityLabel={I18n.t("profile.main.designSystem")}
          onPress={() =>
            navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
              screen: ROUTES.DESIGN_SYSTEM
            })
          }
        />
        <Divider />
        <DSEnableSwitch />

        {/* —————————————————— */}

        {/* Data */}

        {isDebugModeEnabled && (
          <>
            <VSpacer size={24} />
            <ListItemHeader label="Data" />
            <React.Fragment>
              {isFastLoginEnabled &&
                this.debugCopyListItem(
                  "Fast Login",
                  `${isFastLoginEnabled}`,
                  () => clipboardSetStringWithFeedback(`${isFastLoginEnabled}`)
                )}

              {isDevEnv &&
                sessionToken &&
                this.debugCopyListItem("Session token", sessionToken, () =>
                  clipboardSetStringWithFeedback(sessionToken)
                )}

              {isDevEnv &&
                walletToken &&
                this.debugCopyListItem("Wallet token", walletToken, () =>
                  clipboardSetStringWithFeedback(walletToken)
                )}

              {isDevEnv &&
                this.debugCopyListItem("Notification ID", notificationId, () =>
                  clipboardSetStringWithFeedback(notificationId)
                )}

              {isDevEnv &&
                notificationToken &&
                this.debugCopyListItem(
                  "Notification token",
                  notificationToken,
                  () => clipboardSetStringWithFeedback(notificationToken)
                )}

              {this.debugCopyListItem("Device unique ID", deviceUniqueId, () =>
                clipboardSetStringWithFeedback(deviceUniqueId)
              )}

              {thumbprint &&
                this.debugCopyListItem("Thumbprint", thumbprint, () =>
                  clipboardSetStringWithFeedback(thumbprint)
                )}

              <VSpacer size={32} />

              <ListItemHeader label="Actions" />

              {this.debugListItem(
                I18n.t("profile.main.cache.clear"),
                this.handleClearCachePress,
                true
              )}

              {isDevEnv &&
                this.debugListItem(
                  I18n.t("profile.main.forgetCurrentSession"),
                  dispatchSessionExpired,
                  true
                )}
              {isDevEnv &&
                this.debugListItem(
                  I18n.t("profile.main.clearAsyncStorage"),
                  () => {
                    void AsyncStorage.clear();
                  },
                  true
                )}
              {isDevEnv &&
                this.debugListItem(
                  I18n.t("profile.main.dumpAsyncStorage"),
                  () => {
                    /* eslint-disable no-console */
                    console.log("[DUMP START]");
                    AsyncStorage.getAllKeys()
                      .then(keys => {
                        console.log(`\tAvailable keys: ${keys.join(", ")}`);
                        return Promise.all(
                          keys.map(key =>
                            AsyncStorage.getItem(key).then(value => {
                              console.log(`\tValue for ${key}\n\t\t`, value);
                            })
                          )
                        );
                      })
                      .then(() => console.log("[DUMP END]"))
                      .catch(e => console.error(e));
                    /* eslint-enable no-console */
                  },
                  false
                )}
            </React.Fragment>
          </>
        )}
      </React.Fragment>
    );
  }

  public render() {
    const { navigation } = this.props;

    const showInformationModal = (
      title: TranslationKeys,
      body: TranslationKeys
    ) => {
      this.props.showModal(
        <ContextualInfo
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    const profileNavListItems: ReadonlyArray<ProfileNavListItem> = [
      {
        // Data
        value: I18n.t("profile.main.data.title"),
        description: I18n.t("profile.main.data.description"),
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_DATA
          })
      },
      {
        // Preferences
        value: I18n.t("profile.main.preferences.title"),
        description: I18n.t("profile.main.preferences.description"),
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_PREFERENCES_HOME
          })
      },
      {
        // Security
        value: I18n.t("profile.main.security.title"),
        description: I18n.t("profile.main.security.description"),
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_SECURITY
          })
      },
      {
        // Privacy
        value: I18n.t("profile.main.privacy.title"),
        description: I18n.t("profile.main.privacy.description"),
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_PRIVACY_MAIN
          })
      },
      {
        // Info about IO app
        value: I18n.t("profile.main.appInfo.title"),
        description: I18n.t("profile.main.appInfo.description"),
        onPress: () =>
          showInformationModal(
            "profile.main.appInfo.title",
            "profile.main.appInfo.contextualHelpContent"
          ),
        hideChevron: true
      },
      {
        // Logout/Exit
        value: I18n.t("profile.main.logout"),
        description: I18n.t("profile.logout.menulabel"),
        onPress: this.onLogoutPress,
        hideChevron: true
      }
    ];

    const renderProfileNavItem = ({
      item: { value, description, onPress, testID, hideChevron }
    }: ListRenderItemInfo<ProfileNavListItem>) => (
      <ListItemNav
        accessibilityLabel={value}
        value={value}
        description={description}
        onPress={onPress}
        testID={testID}
        hideChevron={hideChevron}
      />
    );

    const screenContent = () => (
      <ScrollView style={IOStyles.bgWhite}>
        <VSpacer size={16} />
        <FlatList
          scrollEnabled={false}
          keyExtractor={(item: ProfileNavListItem, index: number) =>
            `${item.value}-${index}`
          }
          contentContainerStyle={{
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
          data={profileNavListItems}
          renderItem={renderProfileNavItem}
          ItemSeparatorComponent={() => <Divider />}
        />

        <ContentWrapper>
          <AppVersion onPress={this.onTapAppVersion} />

          {/* Developers Section */}
          {(this.props.isDebugModeEnabled || isDevEnv) &&
            this.renderDeveloperSection()}

          {/* End margin */}
          <VSpacer size={24} />
        </ContentWrapper>
      </ScrollView>
    );

    /* The dimensions of the screen that will be used
    to hide the white background when inertial
    scrolling is turned on. */
    const { height: screenHeight, width: screenWidth } =
      Dimensions.get("screen");

    return (
      <DarkLayout
        referenceToContentScreen={(c: ScreenContentRoot) => {
          this.props.setTabPressCallback(
            // eslint-disable-next-line no-underscore-dangle
            () => () => c._root.scrollToPosition(0, 0)
          );

          return c;
        }}
        accessibilityLabel={I18n.t("profile.main.title")}
        appLogo={true}
        hideBaseHeader={true}
        hideHeader={true}
        topContent={
          <>
            {/* Add a fake View with a dark background to hide
            the white block when the inertial scroll is enabled
            (that means the user is using negative scroll values) */}
            <View
              style={{
                position: "absolute",
                top: -screenHeight,
                height: screenHeight,
                width: screenWidth,
                backgroundColor: IOColors.bluegrey
              }}
            />
            {/* End of the hacky solution */}
            <TouchableDefaultOpacity
              accessibilityRole={"button"}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.PROFILE_FISCAL_CODE
                })
              }
            >
              <FiscalCodeComponent type={"Preview"} />
            </TouchableDefaultOpacity>
          </>
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
  isFastLoginEnabled: isFastLoginEnabledSelector(state),
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
  isPnTestEnabled: isPnTestEnabledSelector(state),
  isIdPayTestEnabled: isIdPayTestEnabledSelector(state),
  publicKey: lollipopPublicKeySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => navigateToLogout(),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  setPnTestEnabled: (isPnTestEnabled: boolean) =>
    dispatch(preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled })),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  setIdPayTestEnabled: (isIdPayTestEnabled: boolean) =>
    dispatch(preferencesIdPayTestSetEnabled({ isIdPayTestEnabled })),
  startAddTestCard: () => dispatch(walletAddCoBadgeStart(undefined))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withLightModalContext(withUseTabItemPressWhenScreenActive(ProfileMainScreen))
);
