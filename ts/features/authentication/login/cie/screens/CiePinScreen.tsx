import {
  Banner,
  Body,
  ContentWrapper,
  H2,
  IOStyles,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation
} from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import {
  CieEntityIds,
  CieRequestAuthenticationOverlay
} from "../../../../../components/cie/CieRequestAuthenticationOverlay";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../components/ui/LightModal";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { pinPukHelpUrl } from "../../../../../config";
import {
  isCieLoginUatEnabledSelector,
  isNfcEnabledSelector
} from "../store/selectors";
import { cieFlowForDevServerEnabled } from "../utils";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { loginSuccess } from "../../../common/store/actions";
import { nfcIsEnabled } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { SessionToken } from "../../../../../types/SessionToken";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { getIdpLoginUri } from "../../../../../utils/login";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../../../common/analytics/cieAnalytics";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});
const onOpenForgotPinPage = () => openWebUrl(pinPukHelpUrl);

const CiePinScreen = () => {
  usePreventScreenCapture();
  useOnFirstRender(() => {
    trackLoginCiePinScreen();
  });

  const dispatch = useIODispatch();

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

  useEffect(() => {
    if (authUrlGenerated !== undefined) {
      if (cieFlowForDevServerEnabled) {
        const loginUri = getIdpLoginUri(CieEntityIds.PROD, 3);
        navigation.navigate(AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE, {
          cieConsentUri: loginUri
        });
      } else {
        if (isNfcEnabled) {
          navigation.navigate(AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN, {
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
    isNfcEnabled,
    navigation,
    pin
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

  const isFastLoginFeatureFlagEnabled = useIOSelector(
    isFastLoginEnabledSelector
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
        contentContainerStyle={IOStyles.flex}
        style={IOStyles.flex}
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
                trackLoginCiePinInfo();
                present();
              }}
            >
              {I18n.t("authentication.cie.pin.subtitleCTA")}
            </Body>
            <VSpacer size={24} />
            <View style={IOStyles.flex}>
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
                viewRef={bannerRef}
                color="neutral"
                content={
                  isFastLoginFeatureFlagEnabled
                    ? I18n.t("login.expiration_info_FL")
                    : I18n.t("login.expiration_info")
                }
                pictogramName="passcode"
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
