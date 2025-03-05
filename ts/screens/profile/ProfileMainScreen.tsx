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
import { Alert, FlatList, ListRenderItemInfo, ScrollView } from "react-native";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import AppVersion from "../../components/AppVersion";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { LightModalContext } from "../../components/ui/LightModal";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { isDevEnv } from "../../utils/environment";
import { itwLifecycleIsOperationalOrValid } from "../../features/itwallet/lifecycle/store/selectors";
import {
  appFeedbackEnabledSelector,
  appFeedbackUriConfigSelector
} from "../../store/reducers/backendStatus/remoteConfig";
import { requestAppReview } from "../../features/appReviews/utils/storeReview";
import DeveloperModeSection from "./DeveloperModeSection";
import { ProfileMainScreenTopBanner } from "./ProfileMainScreenTopBanner";

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
  const { hideModal } = useContext(LightModalContext);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { show } = useIOToast();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);
  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector("general"));
  const selectItwLifecycleIsOperationalOrValid = useIOSelector(
    itwLifecycleIsOperationalOrValid
  );
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const idResetTap = useRef<number>();

  const handleContinue = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_LOGOUT
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
    Alert.alert(
      I18n.t("profile.logout.alertTitle"),
      selectItwLifecycleIsOperationalOrValid
        ? I18n.t("profile.logout.activeWiAlertMessage")
        : I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
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
          onPress={requestAppReview}
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
        <AppVersion onPress={onTapAppVersion} />
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
