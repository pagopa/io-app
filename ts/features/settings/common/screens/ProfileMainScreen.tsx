import {
  ContentWrapper,
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemNav,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  useContext,
  ComponentProps,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  Platform,
  ScrollView
} from "react-native";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import I18n from "i18next";
import AppVersion from "../../../../components/AppVersion";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setDebugModeEnabled } from "../../../../store/actions/debug";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import { isDevEnv } from "../../../../utils/environment";
import { itwLifecycleIsOperationalOrValid } from "../../../itwallet/lifecycle/store/selectors";
import {
  appFeedbackEnabledSelector,
  appFeedbackUriConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import DeveloperModeSection from "../../devMode/components/DeveloperModeSection";
import { ProfileMainScreenTopBanner } from "../components/ProfileMainScreenTopBanner";
import { SETTINGS_ROUTES } from "../navigation/routes";
import {
  trackPressLogoutCancelFromIO,
  trackPressLogoutConfirmFromIO,
  trackPressLogoutFromIO
} from "../analytics";
import { ITW_ROUTES } from "../../../itwallet/navigation/routes";
import { itwIsL3EnabledSelector } from "../../../itwallet/common/store/selectors/preferences";

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

type ProfileNavListItem = {
  value: string;
  isHidden?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

const ListItem = memo(ListItemNav);

/**
 * A screen to show all the options related to the user profile
 */
const ProfileMainScreenFC = () => {
  const { hideModal } = useContext(LightModalContext);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { show, error } = useIOToast();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);
  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector("general"));
  const selectItwLifecycleIsOperationalOrValid = useIOSelector(
    itwLifecycleIsOperationalOrValid
  );
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const idResetTap = useRef<number>(undefined);
  const isItwFeaturesAvailable = useIOSelector(itwIsL3EnabledSelector);

  const handleContinue = useCallback(() => {
    trackPressLogoutConfirmFromIO();
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_LOGOUT
    });
  }, [navigation]);

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
    trackPressLogoutFromIO();
    Alert.alert(
      I18n.t("profile.logout.alertTitle"),
      selectItwLifecycleIsOperationalOrValid
        ? I18n.t("profile.logout.activeWiAlertMessage")
        : I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          onPress: () => trackPressLogoutCancelFromIO()
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: handleContinue
        }
      ],
      { cancelable: true }
    );
  }, [handleContinue, selectItwLifecycleIsOperationalOrValid]);

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
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.PROFILE_DATA
      }),
    [navigation]
  );

  const profileNavListItems = useMemo<ReadonlyArray<ProfileNavListItem>>(
    () =>
      [
        {
          // Data
          value: I18n.t("profile.main.data.title"),
          description: I18n.t("profile.main.data.description"),
          onPress: navigateToProfile,
          testID: "profileDataButton"
        },
        {
          // Preferences
          value: I18n.t("profile.main.preferences.title"),
          description: I18n.t("profile.main.preferences.description"),
          onPress: () =>
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_HOME
            })
        },
        {
          // IT Wallet
          value: I18n.t("features.itWallet.settings.item.title"),
          description: I18n.t("features.itWallet.settings.item.description"),
          onPress: () =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.SETTINGS
            }),
          isHidden: !isItwFeaturesAvailable,
          testID: "itWalletSettingsButtonTestID"
        },
        {
          // Security
          value: I18n.t("profile.main.security.title"),
          description: I18n.t("profile.main.security.description"),
          onPress: () =>
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.PROFILE_SECURITY
            })
        },
        {
          // Privacy
          value: I18n.t("profile.main.privacy.title"),
          description: I18n.t("profile.main.privacy.description"),
          onPress: () =>
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN
            })
        },
        {
          // Info about IO app
          value: I18n.t("profile.main.appInfo.title"),
          description: I18n.t("profile.main.appInfo.description"),
          onPress: () =>
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.PROFILE_ABOUT_APP
            })
        }
      ].filter(({ isHidden }) => !isHidden),
    [navigation, navigateToProfile, isItwFeaturesAvailable]
  );

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
  const reviewLabel = I18n.t("profile.appFeedback.reviewLabel");
  const feedbackLabel = I18n.t("profile.appFeedback.feedbackLabel");

  return (
    <>
      <ProfileMainScreenTopBanner />
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
        {appFeedbackEnabled && surveyUrl && (
          <ListItemAction
            label={feedbackLabel}
            icon="message"
            variant="primary"
            testID="feedbackButton"
            onPress={() => {
              void openAuthenticationSession(surveyUrl, "");
            }}
            accessibilityLabel={feedbackLabel}
          />
        )}
        <ListItemAction
          label={reviewLabel}
          icon="starEmpty"
          variant="primary"
          testID="reviewButton"
          onPress={() =>
            openWebUrl(
              Platform.select({
                ios: "https://apps.apple.com/app/id1501681835?action=write-review",
                // On Android we don't have a direct link to the review page we need to link the app page
                default:
                  "https://play.google.com/store/apps/details?id=it.pagopa.io.app"
              }),
              () => error(I18n.t("msgErrorUpdateApp"))
            )
          }
          accessibilityLabel={reviewLabel}
        />
        <ListItemAction
          label={logoutLabel}
          icon="logout"
          variant="danger"
          testID="logoutButton"
          onPress={onLogoutPress}
          accessibilityLabel={logoutLabel}
        />
        <AppVersion
          testID="profileAppVersionButton"
          onPress={onTapAppVersion}
        />
      </ContentWrapper>
      {/* Developer Section */}
      {(isDebugModeEnabled || isDevEnv) && <DeveloperModeSection />}
    </>
  );
};

const ProfileMainScreen = () => {
  const scrollViewContentRef = useRef<ScrollView>(null);

  useTabItemPressWhenScreenActive(
    () => scrollViewContentRef.current?.scrollTo({ y: 0, animated: true }),
    false
  );

  return (
    <IOScrollViewWithLargeHeader
      testID="ProfileMainScreen"
      title={{
        label: I18n.t("global.buttons.settings")
      }}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={{
        title: "profile.main.contextualHelpTitle",
        body: "profile.main.contextualHelpContent"
      }}
      faqCategories={["profile"]}
    >
      <ProfileMainScreenFC />
    </IOScrollViewWithLargeHeader>
  );
};

export default ProfileMainScreen;
