import {
  Banner,
  ContentWrapper,
  Divider,
  H6,
  IOVisualCostants,
  ListItemNav,
  VSpacer,
  useIOTheme,
  useIOToast
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  ComponentProps,
  useMemo,
  memo
} from "react";
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet
} from "react-native";
import AppVersion from "../../components/AppVersion";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import {
  TabBarItemPressType,
  withUseTabItemPressWhenScreenActive
} from "../../components/helpers/withUseTabItemPressWhenScreenActive";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../navigation/params/MainTabParamsList";
import ROUTES from "../../navigation/routes";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { isDevEnv } from "../../utils/environment";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { showProfileBannerSelector } from "../../features/profileSettings/store/selectors";
import { setShowProfileBanner } from "../../features/profileSettings/store/actions";
import DeveloperModeSection from "./DeveloperModeSection";

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

type Props = IOStackNavigationRouteProps<MainTabParamsList, "PROFILE_MAIN"> &
  LightModalContextInterface &
  TabBarItemPressType;

type ProfileNavListItem = {
  value: string;
  renderValue?: (v: string) => JSX.Element;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress" | "hideChevron" | "iconColor" | "icon"
>;

const ListItem = memo(ListItemNav);

/**
 * A screen to show all the options related to the user profile
 */
const ProfileMainScreen = ({ setTabPressCallback, hideModal }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const theme = useIOTheme();
  const { show } = useIOToast();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);
  const showProfileBanner = useIOSelector(showProfileBannerSelector);
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const scrollViewContentRef = useRef<ScrollView>(null);
  const idResetTap = useRef<number>();

  useEffect(() => {
    setTabPressCallback(() => () => {
      if (scrollViewContentRef.current) {
        scrollViewContentRef.current.scrollTo({
          x: 0,
          y: 0,
          animated: true
        });
      }
    });

    return () => {
      hideModal();
      if (idResetTap.current) {
        clearInterval(idResetTap.current);
      }
    };
  }, [hideModal, setTabPressCallback]);

  const onLogoutPress = useCallback(() => {
    Alert.alert(
      I18n.t("profile.logout.alertTitle"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: () =>
            navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
              screen: ROUTES.PROFILE_LOGOUT
            })
        }
      ],
      { cancelable: true }
    );
  }, [navigation]);

  const resetAppTapCounter = useCallback(() => {
    setTapsOnAppVersion(0);
    clearInterval(idResetTap.current);
  }, []);

  // When tapped 5 times activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  const onTapAppVersion = useCallback(() => {
    if (idResetTap.current) {
      clearInterval(idResetTap.current);
    }
    // do nothing
    if (isDebugModeEnabled || isDevEnv) {
      return;
    }
    if (tapsOnAppVersion === consecutiveTapRequired) {
      dispatch(setDebugModeEnabled(true));
      setTapsOnAppVersion(0);
      show(I18n.t("profile.main.developerModeOn"));
    } else {
      // eslint-disable-next-line functional/immutable-data
      idResetTap.current = setInterval(
        resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      setTapsOnAppVersion(prevTaps => prevTaps + 1);
    }
  }, [
    isDebugModeEnabled,
    resetAppTapCounter,
    dispatch,
    show,
    tapsOnAppVersion
  ]);

  const navigateToProfile = useCallback(
    () =>
      navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.PROFILE_DATA
      }),
    [navigation]
  );

  const profileNavListItems = useMemo<ReadonlyArray<ProfileNavListItem>>(
    () => [
      {
        // Data
        value: I18n.t("profile.main.data.title"),
        description: I18n.t("profile.main.data.description"),
        onPress: navigateToProfile
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
        value: I18n.t("profile.logout.menulabel"),
        hideChevron: true,
        iconColor: "error-850",
        testID: "logoutButton",
        icon: "logout",
        renderValue: v => (
          <>
            <VSpacer />
            <H6 color="error-850">{v}</H6>
            <VSpacer />
          </>
        ),
        onPress: onLogoutPress
      }
    ],
    [navigation, onLogoutPress, navigateToProfile]
  );

  const handleCloseBanner = useCallback(() => {
    dispatch(setShowProfileBanner(false));
  }, [dispatch]);

  const keyExtractor = useCallback(
    (item: ProfileNavListItem, index: number) => `${item.value}-${index}`,
    []
  );

  const renderProfileNavItem = useCallback(
    ({ item }: ListRenderItemInfo<ProfileNavListItem>) => {
      const {
        value,
        description,
        testID,
        hideChevron,
        icon,
        iconColor,
        onPress,
        renderValue
      } = item;

      if (icon) {
        return (
          <ListItem
            testID={testID}
            accessibilityLabel={value}
            value={renderValue?.(value) ?? value}
            icon={icon}
            iconColor={iconColor}
            description={description}
            hideChevron={hideChevron}
            onPress={onPress}
          />
        );
      }
      return (
        <ListItem
          testID={testID}
          accessibilityLabel={value}
          value={value}
          description={description}
          hideChevron={hideChevron}
          onPress={onPress}
        />
      );
    },
    []
  );

  return (
    <ScrollView style={{ backgroundColor: theme["appBackground-primary"] }}>
      {showProfileBanner && (
        <ContentWrapper>
          <Banner
            title={I18n.t("profile.main.banner.title")}
            action={I18n.t("profile.main.banner.action")}
            pictogramName="help"
            color="neutral"
            size="big"
            onPress={navigateToProfile}
            onClose={handleCloseBanner}
            labelClose="Close"
          />
        </ContentWrapper>
      )}
      <VSpacer size={16} />
      <FlatList
        scrollEnabled={false}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.flatListContent}
        data={profileNavListItems}
        renderItem={renderProfileNavItem}
        ItemSeparatorComponent={Divider}
      />
      <ContentWrapper>
        <AppVersion onPress={onTapAppVersion} />
      </ContentWrapper>
      {/* Developer Section */}
      {(isDebugModeEnabled || isDevEnv) && <DeveloperModeSection />}
      {/* End Page */}
      <VSpacer size={24} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export default withLightModalContext(
  withUseTabItemPressWhenScreenActive(ProfileMainScreen)
);
