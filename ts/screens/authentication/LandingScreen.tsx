/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import JailMonkey from "jail-monkey";
import { Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, Alert, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useStore } from "react-redux";
import { IOColors, Icon, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import sessionExpiredImg from "../../../img/landing/session_expired.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import CieNotSupported from "../../components/cie/CieNotSupported";
import ContextualInfo from "../../components/ContextualInfo";
import { Link } from "../../components/core/typography/Link";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { DevScreenButton } from "../../components/DevScreenButton";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import ROUTES from "../../navigation/routes";
import {
  idpSelected,
  resetAuthenticationState
} from "../../store/actions/authentication";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector,
  isCieSupportedSelector
} from "../../store/reducers/cie";
import { continueWithRootOrJailbreakSelector } from "../../store/reducers/persistedPreferences";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import { isDevEnv } from "../../utils/environment";
import RootedDeviceModal from "../modal/RootedDeviceModal";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { openWebUrl } from "../../utils/url";
import { cieSpidMoreInfoUrl } from "../../config";
import {
  fastLoginOptInFFEnabled,
  isFastLoginEnabledSelector
} from "../../features/fastLogin/store/selectors";
import { isCieLoginUatEnabledSelector } from "../../features/cieLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../features/cieLogin/utils";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { useIOSelector } from "../../store/hooks";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { LightModalContext } from "../../components/ui/LightModal";
import { continueWithRootOrJailbreak } from "../../store/actions/persistedPreferences";
import {
  trackCieLoginSelected,
  trackMethodInfo,
  trackSpidLoginSelected
} from "./analytics";

const getCards = (
  isCIEAvailable: boolean
): ReadonlyArray<ComponentProps<typeof LandingCardComponent>> => [
  {
    id: 5,
    image: require("../../../img/landing/05.png"),
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
    image: require("../../../img/landing/01.png"),
    title: I18n.t("authentication.landing.card1-title"),
    content: I18n.t("authentication.landing.card1-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card1-title"
    )}. ${I18n.t("authentication.landing.card1-content")}`
  },
  {
    id: 2,
    image: require("../../../img/landing/02.png"),
    title: I18n.t("authentication.landing.card2-title"),
    content: I18n.t("authentication.landing.card2-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card2-title"
    )}. ${I18n.t("authentication.landing.card2-content")}`
  },
  {
    id: 3,
    image: require("../../../img/landing/03.png"),
    title: I18n.t("authentication.landing.card3-title"),
    content: I18n.t("authentication.landing.card3-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card3-title"
    )}. ${I18n.t("authentication.landing.card3-content")}`
  },
  {
    id: 4,
    image: isCIEAvailable
      ? require("../../../img/cie/CIE-onboarding-illustration.png")
      : require("../../../img/landing/04.png"),
    title: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCie")
      : I18n.t("authentication.landing.card4-title"),
    content: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCieContent")
      : I18n.t("authentication.landing.card4-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card4-title"
    )}. ${I18n.t("authentication.landing.card4-content")}`
  }
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.landing.contextualHelpTitle",
  body: "authentication.landing.contextualHelpContent"
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  uatCie: {
    backgroundColor: IOColors.red
  },
  noCie: {
    // don't use opacity since the button still have the active color when it is pressed
    // TODO: Remove this half-disabled state.
    // See also discussion on Slack: https://pagopaspa.slack.com/archives/C012L0U4NQL/p1657171504522639
    backgroundColor: IOColors.noCieButton
  },
  fullOpacity: {
    backgroundColor: variables.brandPrimary
  },
  link: {
    textAlign: "center",
    paddingBottom: 5,
    paddingTop: 4.5,
    lineHeight: 30
  }
});

export const IdpCIE: SpidIdp = {
  id: "cie",
  name: "CIE",
  logo: "",
  profileUrl: ""
};

export const LandingScreen = () => {
  const [isRootedOrJailbroken, setIsRootedOrJailbroken] = React.useState<
    O.Option<boolean>
  >(O.none);

  const store = useStore();

  const dispatch = useDispatch();
  const navigation = useNavigation();

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

  const displayTabletAlert = () =>
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

  const navigateToMarkdown = React.useCallback(
    () =>
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.MARKDOWN
      }),
    [navigation]
  );

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

  const navigateToSpidCieInformationRequest = () => {
    trackMethodInfo();
    openWebUrl(cieSpidMoreInfoUrl);
  };

  const navigateToCieUatSelectionScreen = React.useCallback(() => {
    if (isCieSupported()) {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_LOGIN_CONFIG_SCREEN
      });
    }
  }, [isCieSupported, navigation]);

  const renderCardComponents = () => {
    const cardProps = getCards(isCieSupported());
    return cardProps.map(p => (
      <LandingCardComponent key={`card-${p.id}`} {...p} />
    ));
  };

  const handleContinueWithRootOrJailbreak = (continueWith: boolean) => {
    dispatch(continueWithRootOrJailbreak(continueWith));
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderLandingScreen = () => {
    const firstButtonStyle = isCieUatEnabled
      ? styles.uatCie
      : styles.fullOpacity;
    const secondButtonStyle = isCieSupported()
      ? styles.fullOpacity
      : styles.noCie;
    return (
      <BaseScreenComponent
        appLogo
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={
          isCieSupported() ? ["landing_SPID", "landing_CIE"] : ["landing_SPID"]
        }
      >
        {isDevEnv && <DevScreenButton onPress={navigateToMarkdown} />}

        {isSessionExpired ? (
          <InfoScreenComponent
            title={I18n.t("authentication.landing.session_expired.title")}
            body={I18n.t("authentication.landing.session_expired.body", {
              days: isFastLoginEnabled ? "365" : "30"
            })}
            image={renderInfoRasterImage(sessionExpiredImg)}
          />
        ) : (
          <Content contentContainerStyle={styles.flex} noPadded={true}>
            <HorizontalScroll cards={renderCardComponents()} />
          </Content>
        )}

        <SectionStatusComponent sectionKey={"login"} />
        <View style={IOStyles.footer}>
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            iconLeft={true}
            onPress={
              isCieSupported() ? navigateToCiePinScreen : navigateToIdpSelection
            }
            onLongPress={() =>
              isCieSupported() ? navigateToCieUatSelectionScreen() : ""
            }
            accessibilityRole="button"
            accessible={true}
            style={firstButtonStyle}
            accessibilityLabel={
              isCieSupported()
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")
            }
            testID={
              isCieSupported()
                ? "landing-button-login-cie"
                : "landing-button-login-spid"
            }
          >
            <Icon
              name={isCieSupported() ? "cie" : "navProfile"}
              color="white"
            />
            <HSpacer size={8} />
            <NBButtonText>
              {isCieSupported()
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")}
            </NBButtonText>
          </ButtonDefaultOpacity>
          <VSpacer size={16} />
          <ButtonDefaultOpacity
            accessibilityLabel={
              isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")
            }
            accessibilityRole="button"
            accessible={true}
            style={secondButtonStyle}
            block={true}
            primary={true}
            iconLeft={true}
            onPress={
              isCieSupported() ? navigateToIdpSelection : navigateToCiePinScreen
            }
            testID={
              isCieSupported()
                ? "landing-button-login-spid"
                : "landing-button-login-cie"
            }
          >
            <Icon
              name={isCieSupported() ? "navProfile" : "cie"}
              color="white"
            />
            <HSpacer size={8} />
            <NBButtonText>
              {isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")}
            </NBButtonText>
          </ButtonDefaultOpacity>
          <VSpacer size={16} />
          <Link
            style={styles.link}
            onPress={navigateToSpidCieInformationRequest}
          >
            {isCieSupported()
              ? I18n.t("authentication.landing.nospid-nocie")
              : I18n.t("authentication.landing.nospid")}
          </Link>
        </View>
      </BaseScreenComponent>
    );
  };

  // Screen displayed during the async loading of the JailMonkey.isJailBroken()
  const renderLoadingScreen = () => (
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
    return renderLandingScreen();
  };

  // If the async loading of the isRootedOrJailbroken is not ready, display a loading
  return pipe(
    isRootedOrJailbroken,
    O.fold(
      () => renderLoadingScreen(),
      // when the value isRootedOrJailbroken is ready, display the right screen based on a set of rule
      rootedOrJailbroken => chooseScreenToRender(rootedOrJailbroken)
    )
  );
};
