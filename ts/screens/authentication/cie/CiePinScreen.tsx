import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useSelector } from "react-redux";
import {
  Banner,
  ButtonSolid,
  ContentWrapper,
  H2,
  IOStyles,
  LabelLink,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { CieRequestAuthenticationOverlay } from "../../../components/cie/CieRequestAuthenticationOverlay";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../components/ui/LightModal";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import { nfcIsEnabled } from "../../../store/actions/cie";
import variables from "../../../theme/variables";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";
import { pinPukHelpUrl } from "../../../config";
import { isFastLoginEnabledSelector } from "../../../features/fastLogin/store/selectors";
import { isCieLoginUatEnabledSelector } from "../../../features/cieLogin/store/selectors";
import { withTrailingPoliceCarLightEmojii } from "../../../utils/strings";
import { loginSuccess } from "../../../store/actions/authentication";
import { IdpData } from "../../../../definitions/content/IdpData";
import { SessionToken } from "../../../types/SessionToken";
import { cieFlowForDevServerEnabled } from "../../../features/cieLogin/utils";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../analytics/cieAnalytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import ROUTES from "../../../navigation/routes";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { useIODispatch } from "../../../store/hooks";

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
  const continueButtonRef = useRef<View>(null);
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (pin.length === CIE_PIN_LENGTH) {
      setAccessibilityFocus(continueButtonRef, 100 as Millisecond);
    }
  }, [pin]);

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
    setAuthUrlGenerated(undefined);
    hideModal();
  }, [setAuthUrlGenerated, hideModal]);

  useEffect(() => {
    if (authUrlGenerated !== undefined) {
      if (cieFlowForDevServerEnabled) {
        const token = /token=([\d\w]+)/.exec(authUrlGenerated)?.[1];
        doLoginSuccess(token as SessionToken, "cie");
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

  const showModal = () => {
    requestNfcEnabledCheck();
    Keyboard.dismiss();
    showAnimatedModal(
      <CieRequestAuthenticationOverlay
        onClose={handleAuthenticationOverlayOnClose}
        onSuccess={setAuthUrlGenerated}
      />,
      BottomTopAnimation
    );
  };

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

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
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
            <View
              accessible
              accessibilityLabel={I18n.t(
                "authentication.cie.pin.accessibility.label"
              )}
              accessibilityHint={I18n.t(
                "authentication.cie.pin.accessibility.hint"
              )}
              ref={pinPadViewRef}
            >
              <OTPInput
                secret
                value={pin}
                onValueChange={setPin}
                length={CIE_PIN_LENGTH}
              />
            </View>
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
      {pin.length === CIE_PIN_LENGTH && (
        <ContentWrapper>
          <ButtonSolid
            ref={continueButtonRef}
            label={I18n.t("global.buttons.continue")}
            accessibilityLabel={I18n.t("global.buttons.continue")}
            onPress={showModal}
            fullWidth={true}
          />
          <VSpacer size={24} />
        </ContentWrapper>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        keyboardVerticalOffset={Platform.select({
          ios: 110 + 16,
          android: variables.contentPadding
        })}
      />
      {bottomSheet}
    </SafeAreaView>
  );
};

export default CiePinScreen;
