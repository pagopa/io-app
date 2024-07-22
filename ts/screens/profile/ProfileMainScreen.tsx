import {
  Banner,
  ContentWrapper,
  Divider,
  HeaderSecondLevel,
  IOVisualCostants,
  ListItemAction,
  ListItemNav,
  VSpacer,
  useIOTheme,
  useIOToast
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, {
  useCallback,
  useState,
  useRef,
  ComponentProps,
  useMemo,
  memo,
  useEffect,
  useLayoutEffect
} from "react";
import { Alert, FlatList, ListRenderItemInfo, ScrollView } from "react-native";
import AppVersion from "../../components/AppVersion";
import { LightModalContext } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { isDevEnv } from "../../utils/environment";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { showProfileBannerSelector } from "../../features/profileSettings/store/selectors";
import { setShowProfileBanner } from "../../features/profileSettings/store/actions";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";
import { useHeaderProps } from "../../hooks/useHeaderProps";
import { isSettingsVisibleAndHideProfileSelector } from "../../store/reducers/backendStatus";
import DeveloperModeSection from "./DeveloperModeSection";

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

type ProfileNavListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

const ListItem = memo(ListItemNav);

/**
 * A screen to show all the options related to the user profile
 */
const ProfileMainScreen = () => {
  const { hideModal } = React.useContext(LightModalContext);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const theme = useIOTheme();
  const { show } = useIOToast();
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);
  const showProfileBanner = useIOSelector(showProfileBannerSelector);
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const scrollViewContentRef = useRef<ScrollView>(null);
  const idResetTap = useRef<number>();

  useTabItemPressWhenScreenActive(
    () => scrollViewContentRef.current?.scrollTo({ y: 0, animated: true }),
    false
  );

  useEffect(
    () => () => {
      hideModal();
      if (idResetTap.current) {
        clearInterval(idResetTap.current);
      }
    },
    [hideModal]
  );

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
      }
    ],
    [navigation, navigateToProfile]
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
      const { value, description, testID, onPress } = item;
      const accessibilityLabel = description
        ? `${value}; ${description}`
        : value;

      return (
        <ListItem
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          value={value}
          description={description}
          onPress={onPress}
        />
      );
    },
    []
  );

  const logoutLabel = I18n.t("profile.logout.menulabel");

  const headerProps = useHeaderProps({
    title: "",
    backAccessibilityLabel: I18n.t("global.buttons.back"),
    goBack: () => navigation.goBack(),
    showHelp: true,
    faqCategories: ["profile"],
    contextualHelpMarkdown: {
      title: "profile.main.contextualHelpTitle",
      body: isSettingsVisibleAndHideProfile
        ? "profile.main.contextualHelpContent"
        : "profile.main.legacyContextualHelpContent"
    }
  });

  useLayoutEffect(() => {
    if (isSettingsVisibleAndHideProfile) {
      navigation.setOptions({
        header: () => <HeaderSecondLevel {...headerProps} />
      });
    }
  }, [headerProps, isSettingsVisibleAndHideProfile, navigation]);

  return (
    <ScrollView
      ref={scrollViewContentRef}
      style={{ backgroundColor: theme["appBackground-primary"] }}
    >
      {showProfileBanner && (
        <ContentWrapper>
          <VSpacer size={16} />
          <Banner
            title={I18n.t("profile.main.banner.title")}
            action={I18n.t("profile.main.banner.action")}
            pictogramName="help"
            color="neutral"
            size="big"
            onPress={navigateToProfile}
            onClose={handleCloseBanner}
            labelClose={I18n.t("profile.main.banner.close")}
          />
        </ContentWrapper>
      )}
      <VSpacer size={16} />
      <FlatList
        scrollEnabled={false}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={profileNavListItems}
        renderItem={renderProfileNavItem}
        ItemSeparatorComponent={Divider}
      />
      <VSpacer size={8} />
      <ContentWrapper>
        <ListItemAction
          label={logoutLabel}
          icon="logout"
          variant="danger"
          testID="logoutButton"
          onPress={onLogoutPress}
          accessibilityLabel={logoutLabel}
        />
        <AppVersion onPress={onTapAppVersion} />
      </ContentWrapper>
      {/* Developer Section */}
      {(isDebugModeEnabled || isDevEnv) && <DeveloperModeSection />}
      {/* End Page */}
      <VSpacer size={24} />
    </ScrollView>
  );
};

export default ProfileMainScreen;
