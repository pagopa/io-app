import {
  ContentWrapper,
  Divider,
  IOColors,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
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
import AppVersion from "../../components/AppVersion";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import { IOToast } from "../../components/Toast";
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
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../navigation/params/MainTabParamsList";
import ROUTES from "../../navigation/routes";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { navigateToLogout } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { GlobalState } from "../../store/reducers/types";
import { isDevEnv } from "../../utils/environment";
import DeveloperModeSection from "./DeveloperModeSection";

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
  }

  public componentWillUnmount() {
    // This ensures modals will be closed (if there are some opened)
    this.props.hideModal();
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
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
      IOToast.show(I18n.t("profile.main.developerModeOn"));
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

  public render() {
    const { navigation, isDebugModeEnabled } = this.props;

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
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_ABOUT_APP
          })
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
        </ContentWrapper>

        {/* Developer Section */}
        {(isDebugModeEnabled || isDevEnv) && <DeveloperModeSection />}

        {/* End Page */}
        <VSpacer size={24} />
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
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => navigateToLogout(),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withLightModalContext(withUseTabItemPressWhenScreenActive(ProfileMainScreen))
);
