import {
  Banner,
  Body,
  ContentWrapper,
  H2,
  OTPInput,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import I18n from "i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import IOMarkdown from "../../../../../components/IOMarkdown";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../components/ui/LightModal";
import {
  helpCenterHowToLoginWithEicUrl,
  pinPukHelpUrl
} from "../../../../../config";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { SessionToken } from "../../../../../types/SessionToken";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { trackHelpCenterCtaTapped } from "../../../../../utils/analytics";
import { ContextualHelpPropsMarkdown } from "../../../../../utils/contextualHelp";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { openWebUrl } from "../../../../../utils/url";
import {
  isActiveSessionLoginSelector,
  remoteApiLoginUrlPrefixSelector
} from "../../../activeSessionLogin/store/selectors";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../../../common/analytics/cieAnalytics";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginSuccess } from "../../../common/store/actions";
import { getIdpLoginUri } from "../../../common/utils/login";
import {
  CieEntityIds,
  CieRequestAuthenticationOverlay
} from "../components/CieRequestAuthenticationOverlay";
import { nfcIsEnabled } from "../store/actions";
import {
  isCieLoginUatEnabledSelector,
  isNfcEnabledSelector
} from "../store/selectors";
import { cieFlowForDevServerEnabled } from "../utils";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});
const onOpenForgotPinPage = () => openWebUrl(pinPukHelpUrl);

const CiePinScreen = () => {
  usePreventScreenCapture();

  const { navigateToCieCardReaderScreen, navigateToCieConsentDataUsage } =
    useActiveSessionLoginNavigation();

  const { error } = useIOToast();
  const { name: routeName } = useRoute();

  const dispatch = useIODispatch();

  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const flow = isActiveSessionLogin ? "reauth" : "auth";

  useOnFirstRender(() => {
    trackLoginCiePinScreen(flow);
  });

  const requestNfcEnabledCheck = useCallback(
    () => dispatch(nfcIsEnabled.request()),
    [dispatch]
  );

  const doLoginSuccess = useCallback(
    (token: SessionToken, idp: keyof IdpData) =>
      dispatch(loginSuccess({ token, idp })),
    [dispatch]
  );

  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
      >
    >();
  const [pin, setPin] = useState("");
  const bannerRef = useRef<View>(null);
  const modalTriggerRef = useRef<View>(null);
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );
  const isEnabled = useIOSelector(isNfcEnabledSelector);
  const isNfcEnabled = pot.getOrElse(isEnabled, false);
  const { present, bottomSheet } = useIOBottomSheetModal({
    component: (
      <View>
        <IOMarkdown content={I18n.t("bottomSheets.ciePin.content")} />
        <VSpacer size={24} />
        <Body weight="Semibold" asLink onPress={onOpenForgotPinPage}>
          {I18n.t("authentication.cie.pin.bottomSheetCTA")}
        </Body>
        <VSpacer size={24} />
      </View>
    ),
    title: I18n.t("bottomSheets.ciePin.title"),
    onDismiss: () => {
      setAccessibilityFocus(modalTriggerRef);
    }
  });

  const handleAuthenticationOverlayOnClose = useCallback(() => {
    setPin("");
    setAuthUrlGenerated(undefined);
    hideModal();
  }, [hideModal]);

  const remoteApiLoginUrlPrefix = useIOSelector(
    remoteApiLoginUrlPrefixSelector
  );

  useEffect(() => {
    if (authUrlGenerated !== undefined) {
      if (cieFlowForDevServerEnabled) {
        const loginUri = getIdpLoginUri(
          CieEntityIds.PROD,
          3,
          remoteApiLoginUrlPrefix
        );
        navigateToCieConsentDataUsage({ cieConsentUri: loginUri });
      } else {
        if (isNfcEnabled) {
          navigateToCieCardReaderScreen({
            ciePin: pin,
            authorizationUri: authUrlGenerated
          });
        } else {
          navigation.navigate(AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN, {
            ciePin: pin,
            authorizationUri: authUrlGenerated
          });
        }
      }
      handleAuthenticationOverlayOnClose();
    }
  }, [
    authUrlGenerated,
    doLoginSuccess,
    handleAuthenticationOverlayOnClose,
    isActiveSessionLogin,
    isNfcEnabled,
    navigateToCieCardReaderScreen,
    navigateToCieConsentDataUsage,
    navigation,
    pin,
    remoteApiLoginUrlPrefix
  ]);

  const showModal = useCallback(() => {
    requestNfcEnabledCheck();
    Keyboard.dismiss();
    showAnimatedModal(
      <CieRequestAuthenticationOverlay
        onClose={handleAuthenticationOverlayOnClose}
        onSuccess={setAuthUrlGenerated}
      />,
      BottomTopAnimation
    );
  }, [
    handleAuthenticationOverlayOnClose,
    requestNfcEnabledCheck,
    showAnimatedModal
  ]);

  useEffect(() => {
    if (pin.length === CIE_PIN_LENGTH) {
      showModal();
    }
  }, [pin, showModal]);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(pinPadViewRef, 300 as Millisecond);
    }, [])
  );

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true,
    contextualHelpMarkdown: getContextualHelp()
  });

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        contentContainerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("authentication.cie.pin.pinCardTitle")}</H2>
            <VSpacer size={8} />
            <Body
              ref={modalTriggerRef}
              weight="Semibold"
              asLink
              accessibilityRole="button"
              onPress={() => {
                trackLoginCiePinInfo(flow);
                present();
              }}
            >
              {I18n.t("authentication.cie.pin.subtitleCTA")}
            </Body>
            <VSpacer size={24} />
            <View style={{ flex: 1 }}>
              <OTPInput
                ref={pinPadViewRef}
                secret
                value={pin}
                accessibilityLabel={I18n.t(
                  "authentication.cie.pin.accessibility.label"
                )}
                accessibilityHint={I18n.t(
                  "authentication.cie.pin.accessibility.hint"
                )}
                onValueChange={setPin}
                length={CIE_PIN_LENGTH}
                autoFocus={isFocused}
                deleteButtonAccessibilityLabel={I18n.t(
                  "authentication.cie.pin.accessibility.deleteLabel",
                  { number: pin.slice(-1) }
                )}
                key={isFocused ? "focused" : "unfocused"}
              />
              <VSpacer size={24} />
              <Banner
                ref={bannerRef}
                color="neutral"
                title={I18n.t("login.help_banner_title")}
                content={I18n.t("login.help_banner_content")}
                accessibilityRole="link"
                action={I18n.t("login.help_banner_action")}
                onPress={() => {
                  trackHelpCenterCtaTapped(
                    "LOGIN_CIE_PIN",
                    helpCenterHowToLoginWithEicUrl,
                    routeName
                  );
                  openWebUrl(helpCenterHowToLoginWithEicUrl, () => {
                    error(I18n.t("global.jserror.title"));
                  });
                }}
                pictogramName="help"
              />
            </View>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
      {bottomSheet}
    </SafeAreaView>
  );
};

export default CiePinScreen;
