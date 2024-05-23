import {
  Banner,
  ContentWrapper,
  H2,
  IOStyles,
  LabelLink,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { IdpData } from "../../../../definitions/content/IdpData";
import {
  CieEntityIds,
  CieRequestAuthenticationOverlay
} from "../../../components/cie/CieRequestAuthenticationOverlay";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../components/ui/LightModal";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import { pinPukHelpUrl } from "../../../config";
import { isCieLoginUatEnabledSelector } from "../../../features/cieLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../../features/cieLogin/utils";
import { isFastLoginEnabledSelector } from "../../../features/fastLogin/store/selectors";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import ROUTES from "../../../navigation/routes";
import { loginSuccess } from "../../../store/actions/authentication";
import { nfcIsEnabled } from "../../../store/actions/cie";
import { useIODispatch } from "../../../store/hooks";
import { SessionToken } from "../../../types/SessionToken";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { withTrailingPoliceCarLightEmojii } from "../../../utils/strings";
import { openWebUrl } from "../../../utils/url";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../analytics/cieAnalytics";
import { getIdpLoginUri } from "../../../utils/login";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});
const onOpenForgotPinPage = () => openWebUrl(pinPukHelpUrl);

const CiePinScreen = () => {
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
        typeof ROUTES.CIE_PIN_SCREEN
      >
    >();
  const [pin, setPin] = useState("");
  const bannerRef = useRef<View>(null);
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal({
    component: (
      <View>
        <LegacyMarkdown avoidTextSelection>
          {I18n.t("bottomSheets.ciePin.content")}
        </LegacyMarkdown>
        <VSpacer size={24} />
        <LabelLink onPress={onOpenForgotPinPage}>
          {I18n.t("authentication.cie.pin.bottomSheetCTA")}
        </LabelLink>
        <VSpacer size={24} />
      </View>
    ),
    title: I18n.t("bottomSheets.ciePin.title")
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
        navigation.navigate(ROUTES.CIE_CONSENT_DATA_USAGE, {
          cieConsentUri: loginUri
        });
      } else {
        navigation.navigate(ROUTES.CIE_CARD_READER_SCREEN, {
          ciePin: pin,
          authorizationUri: authUrlGenerated
        });
      }
      handleAuthenticationOverlayOnClose();
    }
  }, [
    handleAuthenticationOverlayOnClose,
    authUrlGenerated,
    hideModal,
    navigation,
    pin,
    doLoginSuccess
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

  const a11yFocusRef = useRef<boolean>(false);

  useFocusEffect(() => {
    if (!a11yFocusRef.current) {
      setAccessibilityFocus(pinPadViewRef, 100 as Millisecond);
      // eslint-disable-next-line functional/immutable-data
      a11yFocusRef.current = true;
    }
  });

  const isFastLoginFeatureFlagEnabled = useSelector(isFastLoginEnabledSelector);
  const useCieUat = useSelector(isCieLoginUatEnabledSelector);

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true,
    contextualHelpMarkdown: getContextualHelp()
  });

  const headerHeight = useHeaderHeight();

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
            <LabelLink
              onPress={() => {
                trackLoginCiePinInfo();
                present();
              }}
            >
              {I18n.t("authentication.cie.pin.subtitleCTA")}
            </LabelLink>
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
                autoFocus
              />
              <VSpacer size={24} />
              <Banner
                viewRef={bannerRef}
                color="neutral"
                size="small"
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
