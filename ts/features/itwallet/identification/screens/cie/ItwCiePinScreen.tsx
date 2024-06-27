import {
  ContentWrapper,
  H2,
  IOStyles,
  LabelLink,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation
} from "@react-navigation/native";
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
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  CieEntityIds,
  CieRequestAuthenticationOverlay
} from "../../../../../components/cie/CieRequestAuthenticationOverlay";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../components/ui/LightModal";
import LegacyMarkdown from "../../../../../components/ui/Markdown/LegacyMarkdown";
import { pinPukHelpUrl } from "../../../../../config";
import { isCieLoginUatEnabledSelector } from "../../../../../features/cieLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../../../../features/cieLogin/utils";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { nfcIsEnabled } from "../../../../../store/actions/cie";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../../../../../screens/authentication/analytics/cieAnalytics"; // TODO: separate cie analytics?
import { isNfcEnabledSelector } from "../../../../../store/reducers/cie";
import { getIdpLoginUri } from "../../../../../utils/login";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwParamsList } from "../../../navigation/ItwParamsList";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});
const onOpenForgotPinPage = () => openWebUrl(pinPukHelpUrl);

export const ItwCiePinScreen = () => {
  useOnFirstRender(() => {
    trackLoginCiePinScreen();
  });

  const dispatch = useIODispatch();

  const requestNfcEnabledCheck = useCallback(
    () => dispatch(nfcIsEnabled.request()),
    [dispatch]
  );

  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        ItwParamsList,
        typeof ITW_ROUTES.ISSUANCE.EID_CIE.PIN_SCREEN
      >
    >();
  const [pin, setPin] = useState("");
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );
  const isEnabled = useIOSelector(isNfcEnabledSelector);
  const isNfcEnabled = pot.getOrElse(isEnabled, false);
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
        navigation.navigate(ITW_ROUTES.ISSUANCE.EID_CIE.CONSENT_DATA_USAGE, {
          cieConsentUri: loginUri
        });
      } else {
        if (isNfcEnabled) {
          navigation.navigate(ITW_ROUTES.ISSUANCE.EID_CIE.CARD_READER_SCREEN, {
            ciePin: pin,
            authorizationUri: authUrlGenerated
          });
        } else {
          /* navigation.navigate(ROUTES.CIE_ACTIVATE_NFC_SCREEN, {
            ciePin: pin,
            authorizationUri: authUrlGenerated
          }); */
        }
      }
      handleAuthenticationOverlayOnClose();
    }
  }, [
    authUrlGenerated,
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
    React.useCallback(() => {
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
                autoFocus={isFocused}
                key={isFocused ? "focused" : "unfocused"}
              />
            </View>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
      {bottomSheet}
    </SafeAreaView>
  );
};
