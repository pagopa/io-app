/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import {
  Banner,
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  ModuleNavigation,
  VSpacer,
  Tooltip,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import JailMonkey from "jail-monkey";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ComponentProps
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import _isEqual from "lodash/isEqual";
import { LandingCardComponent } from "../../../components/LandingCardComponent";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import SectionStatusComponent from "../../../components/SectionStatus";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import {
  isCieIDTourGuideEnabledSelector,
  isCieLoginUatEnabledSelector
} from "../../cieLogin/store/selectors";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import {
  resetAuthenticationState,
  sessionExpired
} from "../../authentication/store/actions";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { isSessionExpiredSelector } from "../../authentication/store/selectors";
import { continueWithRootOrJailbreakSelector } from "../../../store/reducers/persistedPreferences";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../utils/url";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { tosConfigSelector } from "../../tos/store/selectors";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import { cieIDDisableTourGuide } from "../../cieLogin/store/actions";
import { SpidLevel } from "../../../features/cieLogin/utils";
import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../config";
import { trackHelpCenterCtaTapped } from "../../../utils/analytics";
import { isTablet } from "../../../utils/device";
import { LandingSessionExpiredComponent } from "./components/LandingSessionExpiredComponent";
import {
  loginCieWizardSelected,
  trackCieBottomSheetScreenView,
  trackCieIDLoginSelected,
  trackCieLoginSelected,
  trackCiePinLoginSelected,
  trackMethodInfo,
  trackSpidLoginSelected
} from "./analytics";
import { Carousel } from "./carousel/Carousel";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.landing.contextualHelpTitle",
  body: "authentication.landing.contextualHelpContent"
};

const SPACE_BETWEEN_BUTTONS = 8;
const SPACE_AROUND_BUTTON_LINK = 16;
const SPID_LEVEL: SpidLevel = "SpidL2";

export const LandingScreen = () => {
  const { error } = useIOToast();
  const store = useIOStore();
  const insets = useSafeAreaInsets();
  const isCieIDTourGuideEnabled = useIOSelector(
    isCieIDTourGuideEnabledSelector
  );
  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const {
    navigateToIdpSelection,
    navigateToCiePinInsertion,
    navigateToCieIdLoginScreen,
    isCieSupported
  } = useNavigateToLoginMethod();

  const handleNavigateToCiePinScreen = useCallback(() => {
    void trackCiePinLoginSelected(store.getState());
    navigateToCiePinInsertion();
  }, [store, navigateToCiePinInsertion]);

  const handleNavigateToCieIdLoginScreen = useCallback(() => {
    void trackCieIDLoginSelected(store.getState(), SPID_LEVEL);
    navigateToCieIdLoginScreen(SPID_LEVEL);
  }, [store, navigateToCieIdLoginScreen]);

  const {
    present,
    dismiss: dismissBottomSheet,
    bottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t("authentication.landing.cie_bottom_sheet.title"),
    component: (
      <View>
        <ModuleNavigation
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.title"
          )}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.subtitle"
          )}
          icon="fiscalCodeIndividual"
          testID="bottom-sheet-login-with-cie-pin"
          onPress={handleNavigateToCiePinScreen}
        />
        <VSpacer size={8} />
        <ModuleNavigation
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.title"
          )}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.subtitle"
          )}
          icon="device"
          testID="bottom-sheet-login-with-cie-id"
          badge={{
            variant: "highlight",
            text: I18n.t(
              "authentication.landing.cie_bottom_sheet.module_cie_id.badge"
            )
          }}
          onPress={handleNavigateToCieIdLoginScreen}
        />
        <VSpacer size={24} />
        <Banner
          onPress={() => {
            void loginCieWizardSelected();

            navigation.navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.AUTHENTICATION_CIE_ID_WIZARD
            });
          }}
          testID="bottom-sheet-login-wizards"
          pictogramName="help"
          color="turquoise"
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.title"
          )}
          action={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.action"
          )}
        />
        <VSpacer />
      </View>
    ),
    snapPoint: [400]
  });

  const tosConfig = useIOSelector(tosConfigSelector, _isEqual);
  const privacyUrl = tosConfig.tos_url;

  const [isRootedOrJailbroken, setIsRootedOrJailbroken] = useState<
    O.Option<boolean>
  >(O.none);
  const [
    hasTabletCompatibilityAlertAlreadyShown,
    setHasTabletCompatibilityAlertAlreadyShown
  ] = useState<boolean>(false);

  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isSessionExpired = useIOSelector(isSessionExpiredSelector);
  // Since the page is rendered more than once
  // and if the session is expired
  // we dispatch the resetAuthenticationState action,
  // we need to keep track of the session expiration.
  const isSessionExpiredRef = useRef(false);

  const isContinueWithRootOrJailbreak = useIOSelector(
    continueWithRootOrJailbreakSelector
  );

  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  useOnFirstRender(() => {
    const isRootedOrJailbrokenFromJailMonkey = JailMonkey.isJailBroken();
    setIsRootedOrJailbroken(O.some(isRootedOrJailbrokenFromJailMonkey));
    if (isSessionExpired) {
      // eslint-disable-next-line functional/immutable-data
      isSessionExpiredRef.current = isSessionExpired;
      dispatch(resetAuthenticationState());
    }
  });

  // We reset the session expiration flag
  // when the component is unmounted
  useEffect(
    () => () => {
      // eslint-disable-next-line functional/immutable-data
      isSessionExpiredRef.current = false;
    },
    []
  );

  const displayTabletAlert = useCallback(() => {
    if (!hasTabletCompatibilityAlertAlreadyShown) {
      setHasTabletCompatibilityAlertAlreadyShown(true);
      Alert.alert(
        "",
        I18n.t("tablet.message"),
        [
          {
            text: I18n.t("global.buttons.continue"),
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
    }
  }, [hasTabletCompatibilityAlertAlreadyShown]);

  const navigateToCiePinScreen = useCallback(() => {
    void trackCieLoginSelected();
    if (isCieSupported) {
      void trackCieBottomSheetScreenView();
      present();
    } else {
      handleNavigateToCieIdLoginScreen();
    }
  }, [present, isCieSupported, handleNavigateToCieIdLoginScreen]);

  const navigateToPrivacyUrl = useCallback(() => {
    trackMethodInfo();
    openWebUrl(privacyUrl);
  }, [privacyUrl]);

  const navigateToCieUatSelectionScreen = useCallback(() => {
    if (isCieSupported) {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_LOGIN_CONFIG_SCREEN
      });
    }
  }, [isCieSupported, navigation]);

  const LandingScreenComponent = () => {
    useHeaderSecondLevel({
      title: "",
      supportRequest: true,
      canGoBack: false,
      contextualHelpMarkdown
    });

    const { name: routeName } = useRoute();

    const carouselCards: ReadonlyArray<
      ComponentProps<typeof LandingCardComponent>
    > = useMemo(
      () => [
        {
          id: 0,
          pictogramName: "hello",
          title: I18n.t("authentication.landing.card0-title"),
          content: I18n.t("authentication.landing.card0-content"),
          accessibilityLabel: `${I18n.t(
            "authentication.landing.accessibility.carousel.label"
          )}. ${I18n.t("authentication.landing.card0-title")}. ${I18n.t(
            "authentication.landing.card0-content-accessibility"
          )}`,
          accessibilityHint: I18n.t(
            "authentication.landing.accessibility.carousel.hint"
          )
        },
        {
          id: 1,
          pictogramName: "itWallet",
          title: I18n.t("authentication.landing.card1-title"),
          content: I18n.t("authentication.landing.card1-content"),
          accessibilityLabel: `${I18n.t(
            "authentication.landing.card1-title"
          )}. ${I18n.t("authentication.landing.card1-content")}`
        },
        {
          id: 2,
          pictogramName: "message",
          title: I18n.t("authentication.landing.card2-title"),
          content: I18n.t("authentication.landing.card2-content"),
          accessibilityLabel: `${I18n.t(
            "authentication.landing.card2-title"
          )}. ${I18n.t("authentication.landing.card2-content")}`
        },
        {
          id: 3,
          pictogramName: "payments",
          title: I18n.t("authentication.landing.card3-title"),
          content: I18n.t("authentication.landing.card3-content"),
          accessibilityLabel: `${I18n.t(
            "authentication.landing.card3-title"
          )}. ${I18n.t("authentication.landing.card3-content")}`
        },
        {
          id: 4,
          pictogramName: "searchLens",
          title: I18n.t("authentication.landing.card4-title"),
          content: I18n.t("authentication.landing.card4-content"),
          accessibilityLabel: `${I18n.t(
            "authentication.landing.card4-title"
          )}. ${I18n.t("authentication.landing.card4-content")}`
        }
      ],
      []
    );

    return (
      <View style={IOStyles.flex}>
        {isSessionExpiredRef.current ? (
          <LandingSessionExpiredComponent
            ref={accessibilityFirstFocuseViewRef}
            pictogramName={"identityCheck"}
            title={I18n.t("authentication.landing.session_expired.title")}
            content={I18n.t("authentication.landing.session_expired.body")}
            buttonLink={{
              label: I18n.t(
                "authentication.landing.session_expired.linkButtonLabel"
              ),
              color: "primary",
              icon: "instruction",
              onPress: () => {
                trackHelpCenterCtaTapped(
                  sessionExpired.toString(),
                  helpCenterHowToDoWhenSessionIsExpiredUrl,
                  routeName
                );
                openWebUrl(helpCenterHowToDoWhenSessionIsExpiredUrl, () => {
                  error(I18n.t("global.jserror.title"));
                });
              }
            }}
          />
        ) : (
          <Carousel
            ref={accessibilityFirstFocuseViewRef}
            carouselCards={carouselCards}
            dotEasterEggCallback={navigateToCieUatSelectionScreen}
          />
        )}

        <SectionStatusComponent sectionKey={"login"} />
        <ContentWrapper>
          <Tooltip
            closeIconAccessibilityLabel={I18n.t("global.buttons.close")}
            isVisible={isCieIDTourGuideEnabled}
            onClose={() => dispatch(cieIDDisableTourGuide())}
            title={I18n.t("authentication.landing.tour_guide.title")}
            content={I18n.t("authentication.landing.tour_guide.content")}
          >
            <ButtonSolid
              testID="landing-button-login-cie"
              accessibilityLabel={I18n.t("authentication.landing.loginCie")}
              fullWidth
              color={isCieUatEnabled ? "danger" : "primary"}
              label={I18n.t("authentication.landing.loginCie")}
              icon="cieLetter"
              onPress={navigateToCiePinScreen}
            />
          </Tooltip>
          <VSpacer size={SPACE_BETWEEN_BUTTONS} />
          <ButtonSolid
            testID="landing-button-login-spid"
            fullWidth
            accessibilityLabel={I18n.t("authentication.landing.loginSpid")}
            color="primary"
            // if CIE is not supported, since the new DS has not a
            // "semi-enabled" state, we leave the button enabled
            // but we navigate to the CIE unsupported info screen.
            label={I18n.t("authentication.landing.loginSpid")}
            icon="spid"
            onPress={() => {
              void trackSpidLoginSelected();
              navigateToIdpSelection();
            }}
          />
          <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
          <View style={IOStyles.selfCenter}>
            <ButtonLink
              accessibilityRole="link"
              accessibilityLabel={I18n.t("authentication.landing.privacyLink")}
              color="primary"
              label={I18n.t("authentication.landing.privacyLink")}
              onPress={navigateToPrivacyUrl}
            />
            <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
          </View>
          {insets.bottom !== 0 && <VSpacer size={SPACE_AROUND_BUTTON_LINK} />}
          {bottomSheet}
        </ContentWrapper>
      </View>
    );
  };

  // Screen displayed during the async loading of the JailMonkey.isJailBroken()
  const LoadingScreen = () => (
    <View style={{ flex: 1 }}>
      <LoadingSpinnerOverlay isLoading={true} />
    </View>
  );

  useEffect(() => {
    // if the device is compromised and the user didn't allow to continue
    // show a blocking modal
    if (
      O.isSome(isRootedOrJailbroken) &&
      isRootedOrJailbroken.value &&
      !isContinueWithRootOrJailbreak
    ) {
      void mixpanelTrack("SHOW_ROOTED_OR_JAILBROKEN_MODAL");
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_ROOTED_DEVICE
      });
    }
  }, [isContinueWithRootOrJailbreak, isRootedOrJailbroken, navigation]);

  // If the async loading of the isRootedOrJailbroken is not ready, display a loading
  if (O.isNone(isRootedOrJailbroken)) {
    return <LoadingScreen />;
  } else {
    if (isTablet()) {
      displayTabletAlert();
    }
    return <LandingScreenComponent />;
  }
};
