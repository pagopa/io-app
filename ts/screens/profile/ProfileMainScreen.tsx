import {
  Banner,
  ContentWrapper,
  Divider,
  HeaderSecondLevel,
  IOVisualCostants,
  ListItemAction,
  ListItemNav,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, {
  ComponentProps,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, FlatList, ListRenderItemInfo } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { TranslationKeys } from "../../../locales/locales";
import AppVersion from "../../components/AppVersion";
import HeaderFirstLevel from "../../components/ui/HeaderFirstLevel";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { LightModalContext } from "../../components/ui/LightModal";
import { setShowProfileBanner } from "../../features/profileSettings/store/actions";
import { showProfileBannerSelector } from "../../features/profileSettings/store/selectors";
import { useHeaderFirstLevelActionPropHelp } from "../../hooks/useHeaderFirstLevelActionPropHelp";
import { useHeaderProps } from "../../hooks/useHeaderProps";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../store/reducers/backendStatus";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { isDevEnv } from "../../utils/environment";
import DeveloperModeSection from "./DeveloperModeSection";
import useContentWithFF from "./useContentWithFF";

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
const ProfileMainScreenFC = () => {
  const { hideModal } = React.useContext(LightModalContext);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { show } = useIOToast();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);
  const showProfileBanner = useIOSelector(showProfileBannerSelector);
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const idResetTap = useRef<number>();

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

  return (
    <>
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
    </>
  );
};

const ProfileMainScreen = () => {
  const navigation = useIONavigation();
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  const contextualHelpTitleContent = useContentWithFF(
    "profile.main.contextualHelpTitle"
  );
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  useTabItemPressWhenScreenActive(
    () => scrollViewContentRef.current?.scrollTo({ y: 0, animated: true }),
    false
  );

  const headerProps = useHeaderProps({
    title: "",
    backAccessibilityLabel: I18n.t("global.buttons.back"),
    goBack: () => navigation.goBack(),
    showHelp: true,
    faqCategories: ["profile"],
    contextualHelpMarkdown: {
      title: contextualHelpTitleContent as TranslationKeys,
      body: isSettingsVisibleAndHideProfile
        ? "profile.main.contextualHelpContent"
        : "profile.main.legacyContextualHelpContent"
    }
  });

  const helpAction = useHeaderFirstLevelActionPropHelp(ROUTES.PROFILE_MAIN);

  useLayoutEffect(() => {
    if (isSettingsVisibleAndHideProfile) {
      navigation.setOptions({
        header: () => <HeaderSecondLevel {...headerProps} />
      });
    } else {
      const headerFirstLevelProps: HeaderFirstLevel = {
        title: I18n.t("profile.main.title"),
        type: "singleAction",
        firstAction: helpAction,
        animatedRef: scrollViewContentRef
      };

      navigation.setOptions({
        header: () => <HeaderFirstLevel {...headerFirstLevelProps} />
      });
    }
  }, [
    headerProps,
    helpAction,
    isSettingsVisibleAndHideProfile,
    navigation,
    scrollViewContentRef
  ]);

  if (isSettingsVisibleAndHideProfile) {
    return (
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t("global.buttons.settings")
        }}
        headerActionsProp={{ showHelp: true }}
        contextualHelpMarkdown={{
          title: contextualHelpTitleContent as TranslationKeys,
          body: isSettingsVisibleAndHideProfile
            ? "profile.main.contextualHelpContent"
            : "profile.main.legacyContextualHelpContent"
        }}
        faqCategories={["profile"]}
      >
        <ProfileMainScreenFC />
      </IOScrollViewWithLargeHeader>
    );
  }
  return (
    <Animated.ScrollView ref={scrollViewContentRef}>
      <ProfileMainScreenFC />
      <VSpacer size={24} />
    </Animated.ScrollView>
  );
};

export default ProfileMainScreen;
