/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import {
  Banner,
  ContentWrapper,
  IOButton,
  ModuleNavigation,
  Tooltip,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import JailMonkey from "jail-monkey";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LandingCardComponent } from "../../../../../components/LandingCardComponent";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../../../config";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { mixpanelTrack } from "../../../../../mixpanel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import {
  sessionCorrupted,
  sessionExpired
} from "../../../common/store/actions";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { continueWithRootOrJailbreakSelector } from "../../../../../store/reducers/persistedPreferences";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { trackHelpCenterCtaTapped } from "../../../../../utils/analytics";
import { isTablet } from "../../../../../utils/device";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../../utils/url";
import {
  loginCieWizardSelected,
  trackCieBottomSheetScreenView,
  trackCieIDLoginSelected,
  trackCieLoginSelected,
  trackCiePinLoginSelected,
  trackSpidLoginSelected
} from "../../../common/analytics";
import { Carousel } from "../../../common/components/Carousel";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { sessionExpired } from "../../../common/store/actions";

import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { ContextualHelpPropsMarkdown } from "../../../../../utils/contextualHelp";
import { identificationRequest } from "../../../../identification/store/actions";
import { setOfflineAccessReason } from "../../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { itwOfflineAccessAvailableSelector } from "../../../../itwallet/common/store/selectors";
import {
  isSessionCorruptedSelector,
  isSessionExpiredSelector
} from "../../../common/store/selectors";
import { cieIDDisableTourGuide } from "../../cie/store/actions";
import {
  isCieIDTourGuideEnabledSelector,
  isCieLoginUatEnabledSelector
} from "../../cie/store/selectors";
import { SpidLevel } from "../../cie/utils";
import useNavigateToLoginMethod from "../../hooks/useNavigateToLoginMethod";
import { LandingSessionExpiredComponent } from "../components/LandingSessionExpiredComponent";
import { useInfoBottomsheetComponent } from "../hooks/useInfoBottomsheetComponent";

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
  const itwOfflineAccessAvailable = useIOSelector(
    itwOfflineAccessAvailableSelector
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

  const { presentInfoBottomsheet, infoBottomsheetComponent } =
    useInfoBottomsheetComponent();

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

            navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
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
  const isSessionCorrupted = useIOSelector(isSessionCorruptedSelector);

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
  });

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

  const navigateToCieUatSelectionScreen = useCallback(() => {
    if (isCieSupported) {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_LOGIN_CONFIG_SCREEN
      });
    }
  }, [isCieSupported, navigation]);

  const LandingScreenComponent = () => {
    useHeaderSecondLevel({
      title: "",
      supportRequest: true,
      canGoBack: false,
      contextualHelpMarkdown,
      variant: "primary",
      secondAction: {
        icon: "info",
        onPress: presentInfoBottomsheet,
        accessibilityLabel: I18n.t(
          "authentication.landing.useful_resources.bottomSheet.title"
        )
      }
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

    const navigateToWallet = () => {
      dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.SESSION_EXPIRED));
      dispatch(
        identificationRequest(false, false, undefined, undefined, {
          onSuccess: () => {
            // This dispatch mounts the new offline navigator.
            // It must be initialized **after** the user completes
            // biometric authentication to prevent graphical glitches.
            dispatch(startupLoadSuccess(StartupStatusEnum.OFFLINE));
          }
        })
      );
    };

    const sessionIssueLocalizationKey = isSessionExpired
      ? "session_expired"
      : "session_corrupted";

    return (
      <View style={{ flex: 1 }} testID="LandingScreen">
        {isSessionExpired || isSessionCorrupted ? (
          <LandingSessionExpiredComponent
            ref={accessibilityFirstFocuseViewRef}
            pictogramName={"identityCheck"}
            title={I18n.t(
              `authentication.landing.${sessionIssueLocalizationKey}.title`
            )}
            content={I18n.t(
              `authentication.landing.${sessionIssueLocalizationKey}.body`
            )}
            buttonLink={{
              label: I18n.t(
                `authentication.landing.${sessionIssueLocalizationKey}.linkButtonLabel`
              ),
              color: "primary",
              icon: "instruction",
              onPress: () => {
                trackHelpCenterCtaTapped(
                  isSessionExpired
                    ? sessionExpired.toString()
                    : sessionCorrupted.toString(),
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
            <IOButton
              fullWidth
              variant="solid"
              color={isCieUatEnabled ? "danger" : "primary"}
              label={I18n.t("authentication.landing.loginCie")}
              icon="cieLetter"
              onPress={navigateToCiePinScreen}
              testID="landing-button-login-cie"
            />
          </Tooltip>
          <VSpacer size={SPACE_BETWEEN_BUTTONS} />
          <IOButton
            fullWidth
            variant="solid"
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
            testID="landing-button-login-spid"
          />
          <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
          {itwOfflineAccessAvailable && isSessionExpired && (
            <View style={{ alignSelf: "center" }}>
              <IOButton
                variant="link"
                accessibilityRole="link"
                color="primary"
                label={I18n.t("authentication.landing.show_wallet")}
                onPress={navigateToWallet}
              />
              <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
            </View>
          )}
          {insets.bottom !== 0 && <VSpacer size={SPACE_AROUND_BUTTON_LINK} />}
          {bottomSheet}
          {infoBottomsheetComponent}
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
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.ROOTED_DEVICE
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
