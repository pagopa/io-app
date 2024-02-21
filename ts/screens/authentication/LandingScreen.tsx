/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import {
  ButtonLink,
  ButtonSolid,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import JailMonkey from "jail-monkey";
import * as React from "react";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useStore } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Animated,
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import sessionExpiredImg from "../../../img/landing/session_expired.png";
import ContextualInfo from "../../components/ContextualInfo";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import SectionStatusComponent from "../../components/SectionStatus";
import CieNotSupported from "../../components/cie/CieNotSupported";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { LightModalContext } from "../../components/ui/LightModal";
import { privacyUrl } from "../../config";
import { isCieLoginUatEnabledSelector } from "../../features/cieLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../features/cieLogin/utils";
import {
  fastLoginOptInFFEnabled,
  isFastLoginEnabledSelector
} from "../../features/fastLogin/store/selectors";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  idpSelected,
  resetAuthenticationState
} from "../../store/actions/authentication";
import { continueWithRootOrJailbreak } from "../../store/actions/persistedPreferences";
import { useIOSelector } from "../../store/hooks";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector,
  isCieSupportedSelector
} from "../../store/reducers/cie";
import { continueWithRootOrJailbreakSelector } from "../../store/reducers/persistedPreferences";
import { ComponentProps } from "../../types/react";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../utils/url";
import RootedDeviceModal from "../modal/RootedDeviceModal";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import {
  trackCieLoginSelected,
  trackMethodInfo,
  trackSpidLoginSelected
} from "./analytics";

const styles = StyleSheet.create({
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: IOColors.greyLight,
    marginHorizontal: 4
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

const getCards = (): ReadonlyArray<
  ComponentProps<typeof LandingCardComponent>
> => [
  {
    id: 5,
    pictogramName: "hello",
    title: I18n.t("authentication.landing.card5-title"),
    content: I18n.t("authentication.landing.card5-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.accessibility.carousel.label"
    )}. ${I18n.t("authentication.landing.card5-title")}. ${I18n.t(
      "authentication.landing.card5-content-accessibility"
    )}`,
    accessibilityHint: I18n.t(
      "authentication.landing.accessibility.carousel.hint"
    )
  },
  {
    id: 1,
    pictogramName: "star",
    title: I18n.t("authentication.landing.card1-title"),
    content: I18n.t("authentication.landing.card1-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card1-title"
    )}. ${I18n.t("authentication.landing.card1-content")}`
  },
  {
    id: 2,
    pictogramName: "cardFavourite",
    title: I18n.t("authentication.landing.card2-title"),
    content: I18n.t("authentication.landing.card2-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card2-title"
    )}. ${I18n.t("authentication.landing.card2-content")}`
  },
  {
    id: 3,
    pictogramName: "doc",
    title: I18n.t("authentication.landing.card3-title"),
    content: I18n.t("authentication.landing.card3-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card3-title"
    )}. ${I18n.t("authentication.landing.card3-content")}`
  }
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.landing.contextualHelpTitle",
  body: "authentication.landing.contextualHelpContent"
};

export const IdpCIE: SpidIdp = {
  id: "cie",
  name: "CIE",
  logo: "",
  profileUrl: ""
};

export const LandingScreen = () => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { width: windowWidth } = useWindowDimensions();

  const [isRootedOrJailbroken, setIsRootedOrJailbroken] = React.useState<
    O.Option<boolean>
  >(O.none);
  const [
    hasTabletCompatibilityAlertAlreadyShown,
    setHasTabletCompatibilityAlertAlreadyShown
  ] = React.useState<boolean>(false);

  const store = useStore();

  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const isSessionExpired = useIOSelector(isSessionExpiredSelector);

  const isContinueWithRootOrJailbreak = useIOSelector(
    continueWithRootOrJailbreakSelector
  );

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const isFastLoginOptInFFEnabled = useIOSelector(fastLoginOptInFFEnabled);

  const isCIEAuthenticationSupported = useIOSelector(isCieSupportedSelector);
  const hasApiLevelSupport = useIOSelector(hasApiLevelSupportSelector);
  const hasCieApiLevelSupport = pot.getOrElse(hasApiLevelSupport, false);
  const hasNFCFeature = useIOSelector(hasNFCFeatureSelector);
  const hasCieNFCFeature = pot.getOrElse(hasNFCFeature, false);

  const isCieSupported = React.useCallback(
    () =>
      cieFlowForDevServerEnabled ||
      pot.getOrElse(isCIEAuthenticationSupported, false),
    [isCIEAuthenticationSupported]
  );
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

  useOnFirstRender(async () => {
    const isRootedOrJailbroken = await JailMonkey.isJailBroken();
    setIsRootedOrJailbroken(O.some(isRootedOrJailbroken));
    if (isSessionExpired) {
      dispatch(resetAuthenticationState());
    }
  });

  const { hideModal, showAnimatedModal } = React.useContext(LightModalContext);

  const displayTabletAlert = () => {
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
  };

  const navigateToIdpSelection = React.useCallback(() => {
    trackSpidLoginSelected();
    if (isFastLoginOptInFFEnabled) {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_OPT_IN,
        params: { identifier: "SPID" }
      });
    } else {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_SELECTION
      });
    }
  }, [isFastLoginOptInFFEnabled, navigation]);

  const navigateToCiePinScreen = React.useCallback(() => {
    const openUnsupportedCIEModal = () => {
      showAnimatedModal(
        <ContextualInfo
          onClose={hideModal}
          title={I18n.t("authentication.landing.cie_unsupported.title")}
          body={() => (
            <CieNotSupported
              hasCieApiLevelSupport={hasCieApiLevelSupport}
              hasCieNFCFeature={hasCieNFCFeature}
            />
          )}
        />
      );
    };

    if (isCieSupported()) {
      void trackCieLoginSelected(store.getState());
      dispatch(idpSelected(IdpCIE));
      if (isFastLoginOptInFFEnabled) {
        navigation.navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_OPT_IN,
          params: { identifier: "CIE" }
        });
      } else {
        navigation.navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.CIE_PIN_SCREEN
        });
      }
    } else {
      openUnsupportedCIEModal();
    }
  }, [
    dispatch,
    hasCieApiLevelSupport,
    hasCieNFCFeature,
    hideModal,
    isCieSupported,
    isFastLoginOptInFFEnabled,
    navigation,
    showAnimatedModal,
    store
  ]);

  const navigateToPrivacyUrl = () => {
    trackMethodInfo();
    openWebUrl(privacyUrl);
  };

  const navigateToCieUatSelectionScreen = React.useCallback(() => {
    if (isCieSupported()) {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_LOGIN_CONFIG_SCREEN
      });
    }
  }, [isCieSupported, navigation]);

  const renderCardComponents = () => {
    const cardProps = getCards();
    return cardProps.map(p => (
      <LandingCardComponent key={`card-${p.id}`} {...p} />
    ));
  };

  const handleContinueWithRootOrJailbreak = (continueWith: boolean) => {
    dispatch(continueWithRootOrJailbreak(continueWith));
  };

  const LandingScreen = () => {
    useHeaderSecondLevel({
      title: "",
      supportRequest: true,
      canGoBack: false,
      contextualHelpMarkdown
    });

    return (
      <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
        {isSessionExpired ? (
          <InfoScreenComponent
            title={I18n.t("authentication.landing.session_expired.title")}
            body={I18n.t("authentication.landing.session_expired.body", {
              days: isFastLoginEnabled ? "365" : "30"
            })}
            image={renderInfoRasterImage(sessionExpiredImg)}
          />
        ) : (
          <View style={IOStyles.flex}>
            <ScrollView
              horizontal={true}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event([
                {
                  nativeEvent: {
                    contentOffset: {
                      x: scrollX
                    }
                  }
                }
              ])}
              scrollEventThrottle={1}
            >
              {renderCardComponents()}
            </ScrollView>
            <View style={styles.indicatorContainer}>
              {getCards().map((_, imageIndex) => {
                const width = scrollX.interpolate({
                  inputRange: [
                    windowWidth * (imageIndex - 1),
                    windowWidth * imageIndex,
                    windowWidth * (imageIndex + 1)
                  ],
                  outputRange: [8, 16, 8],
                  extrapolate: "clamp"
                });
                const backgroundColor = scrollX.interpolate({
                  inputRange: [
                    windowWidth * (imageIndex - 1),
                    windowWidth * imageIndex,
                    windowWidth * (imageIndex + 1)
                  ],
                  outputRange: [
                    IOColors.greyLight,
                    IOColors.blue,
                    IOColors.greyLight
                  ],
                  extrapolate: "clamp"
                });
                return (
                  <Animated.View
                    key={imageIndex}
                    style={[styles.normalDot, { width, backgroundColor }]}
                  />
                );
              })}
            </View>
            <VSpacer size={16} />
          </View>
        )}

        <SectionStatusComponent sectionKey={"login"} />
        <View style={IOStyles.horizontalContentPadding}>
          <ButtonSolid
            testID={
              isCieSupported()
                ? "landing-button-login-cie"
                : "landing-button-login-spid"
            }
            accessibilityLabel={
              isCieSupported()
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")
            }
            fullWidth={true}
            color="primary"
            label={
              isCieSupported()
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")
            }
            icon={isCieSupported() ? "cie" : "spid"}
            onPress={
              isCieSupported() ? navigateToCiePinScreen : navigateToIdpSelection
            }
          />
          <VSpacer size={16} />
          <ButtonSolid
            testID={
              isCieSupported()
                ? "landing-button-login-spid"
                : "landing-button-login-cie"
            }
            fullWidth={true}
            accessibilityLabel={
              isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")
            }
            color="primary"
            disabled={!isCieSupported()}
            label={
              isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")
            }
            icon={isCieSupported() ? "spid" : "cie"}
            onPress={
              isCieSupported() ? navigateToIdpSelection : navigateToCiePinScreen
            }
          />
          <VSpacer size={16} />
          <View style={IOStyles.selfCenter}>
            <ButtonLink
              accessibilityLabel={I18n.t("authentication.landing.privacyLink")}
              color="primary"
              label={I18n.t("authentication.landing.privacyLink")}
              onPress={navigateToPrivacyUrl}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  };

  // Screen displayed during the async loading of the JailMonkey.isJailBroken()
  const LoadingScreen = () => (
    <View style={{ flex: 1 }}>
      <LoadingSpinnerOverlay isLoading={true} />
    </View>
  );

  const chooseScreenToRender = (isRootedOrJailbroken: boolean) => {
    // if the device is compromised and the user didn't allow to continue
    // show a blocking modal
    if (isRootedOrJailbroken && !isContinueWithRootOrJailbreak) {
      void mixpanelTrack("SHOW_ROOTED_OR_JAILBROKEN_MODAL");
      return (
        <RootedDeviceModal
          onContinue={() => handleContinueWithRootOrJailbreak(true)}
          onCancel={() => handleContinueWithRootOrJailbreak(false)}
        />
      );
    }
    // In case of Tablet, display an alert to inform the user
    if (DeviceInfo.isTablet()) {
      displayTabletAlert();
    }
    // standard rendering of the landing screen

    return <LandingScreen />;
  };

  // If the async loading of the isRootedOrJailbroken is not ready, display a loading
  return pipe(
    isRootedOrJailbroken,
    O.fold(
      () => <LoadingScreen />,
      // when the value isRootedOrJailbroken is ready, display the right screen based on a set of rule
      rootedOrJailbroken => chooseScreenToRender(rootedOrJailbroken)
    )
  );
};
