import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
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
  StyleSheet
} from "react-native";
import { NavigationContext, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import AdviceComponent from "../../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { CieRequestAuthenticationOverlay } from "../../../components/cie/CieRequestAuthenticationOverlay";
import CiePinpad from "../../../components/CiePinpad";
import { Link } from "../../../components/core/typography/Link";
import { IOColors } from "../../../components/core/variables/IOColors";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { nfcIsEnabled } from "../../../store/actions/cie";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { useIOBottomSheet } from "../../../utils/bottomSheet";
import { openWebUrl } from "../../../utils/url";

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestNfcEnabledCheck: () => dispatch(nfcIsEnabled.request())
});

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: variables.contentPadding
  },
  bsLinkButton: {
    paddingRight: 0,
    paddingLeft: 0,
    backgroundColor: IOColors.white
  }
});

const CIE_PIN_LENGTH = 8;
const FORGOT_PIN_PAGE_URL =
  "https://www.cartaidentita.interno.gov.it/richiesta-di-ristampa/";

const getContextualHelp = () => ({
  title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
  body: () => (
    <Markdown>{I18n.t("authentication.cie.pin.contextualHelpBody")}</Markdown>
  )
});
const onOpenForgotPinPage = () => openWebUrl(FORGOT_PIN_PAGE_URL);

const CiePinScreen: React.FC<Props> = props => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const { navigate } = useContext(NavigationContext);
  const [pin, setPin] = useState("");
  const continueButtonRef = useRef<FooterWithButtons>(null);
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (pin.length === CIE_PIN_LENGTH) {
      setAccessibilityFocus(continueButtonRef, 100 as Millisecond);
    }
  }, [pin]);

  const { present } = useIOBottomSheet(
    <View>
      <Markdown avoidTextSelection>
        {I18n.t("bottomSheets.ciePin.content")}
      </Markdown>
      <ButtonDefaultOpacity
        onPress={onOpenForgotPinPage}
        style={styles.bsLinkButton}
        onPressWithGestureHandler={true}
      >
        <Link>{I18n.t("authentication.cie.pin.bottomSheetCTA")}</Link>
      </ButtonDefaultOpacity>
    </View>,
    I18n.t("bottomSheets.ciePin.title"),
    320
  );

  useEffect(() => {
    if (authUrlGenerated !== undefined) {
      setPin("");
      navigate({
        routeName: ROUTES.CIE_CARD_READER_SCREEN,
        params: {
          ciePin: pin,
          authorizationUri: authUrlGenerated
        }
      });
      hideModal();
    }
  }, [authUrlGenerated, hideModal, navigate, pin]);

  const handleAuthenticationOverlayOnClose = () => {
    setPin("");
    hideModal();
  };

  const showModal = () => {
    props.requestNfcEnabledCheck();
    Keyboard.dismiss();
    showAnimatedModal(
      <CieRequestAuthenticationOverlay
        onClose={handleAuthenticationOverlayOnClose}
        onSuccess={setAuthUrlGenerated}
      />,
      BottomTopAnimation
    );
  };

  const doSetAccessibilityFocus = useCallback(() => {
    setAccessibilityFocus(pinPadViewRef, 100 as Millisecond);
  }, [pinPadViewRef]);

  return (
    <TopScreenComponent
      onAccessibilityNavigationHeaderFocus={doSetAccessibilityFocus}
      contextualHelp={getContextualHelp()}
      goBack={true}
      headerTitle={I18n.t("authentication.cie.pin.pinCardHeader")}
    >
      <ScrollView>
        <ScreenContentHeader
          title={I18n.t("authentication.cie.pin.pinCardTitle")}
          icon={require("../../../../img/icons/icon_insert_cie_pin.png")}
          subtitle={I18n.t("authentication.cie.pin.subtitleHelp")}
          subtitleLink={
            <Link onPress={present}>
              {I18n.t("authentication.cie.pin.subtitleCTA")}
            </Link>
          }
        />

        <View spacer={true} />
        <View style={styles.container} accessible={true} ref={pinPadViewRef}>
          <CiePinpad
            pin={pin}
            pinLength={CIE_PIN_LENGTH}
            onPinChanged={setPin}
            onSubmit={showModal}
          />
          <View spacer={true} />
          <AdviceComponent
            text={I18n.t("login.expiration_info")}
            iconColor={"black"}
          />
        </View>
      </ScrollView>
      {pin.length === CIE_PIN_LENGTH && (
        <FooterWithButtons
          ref={continueButtonRef}
          type={"SingleButton"}
          leftButton={{
            primary: true,
            onPress: showModal,
            title: I18n.t("global.buttons.continue")
          }}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        keyboardVerticalOffset={Platform.select({
          ios: 0,
          android: variables.contentPadding
        })}
      />
    </TopScreenComponent>
  );
};

export default connect(null, mapDispatchToProps)(CiePinScreen);
