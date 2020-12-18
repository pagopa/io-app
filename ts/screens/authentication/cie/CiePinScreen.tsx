import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback
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
import CieRequestAuthenticationOverlay from "../../../components/cie/CieRequestAuthenticationOverlay";
import CiePinpad from "../../../components/CiePinpad";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { nfcIsEnabled } from "../../../store/actions/cie";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";
import { setAccessibilityFocus } from "../../../utils/accessibility";

import { isIos } from "../../../utils/platform";
import { useIOBottomSheet } from "../../../utils/bottomSheet";
import { Body } from "../../../components/core/typography/Body";
import { openWebUrl } from "../../../utils/url";
import { Link } from "../../../components/core/typography/Link";
import Markdown from "../../../components/ui/Markdown";

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
  }
});

const CIE_PIN_LENGTH = 8;
const FORGOT_PIN_PAGE_URL =
  "https://www.cartaidentita.interno.gov.it/richiesta-di-ristampa/";

const CiePinScreen: React.FC<Props> = props => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const { navigate } = useContext(NavigationContext);

  const onOpenForgotPINPage = () => openWebUrl(FORGOT_PIN_PAGE_URL);

  const { present } = useIOBottomSheet(
    <View>
      <Body>{I18n.t("authentication.cie.pin.bottomSheetText")}</Body>
      <Link onPress={onOpenForgotPINPage}>
        {I18n.t("authentication.cie.pin.bottomSheetCTA")}
      </Link>
    </View>,
    I18n.t("authentication.cie.pin.bottomSheetTitle"),
    300
  );

  const getContextualHelp = () => ({
    title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
    body: () => (
      <Markdown>{I18n.t("authentication.cie.pin.contextualHelpBody")}</Markdown>
    )
  });

  const [pin, setPin] = useState("");
  const [url, setUrl] = useState<string | undefined>(undefined);

  const continueButtonRef = useRef<FooterWithButtons>(null);
  const PINPadViewRef = useRef<View>(null);

  const onProceedToCardReaderScreen = async (url: string) => {
    setPin("");
    setUrl(url);
  };

  // Handles URL receival.
  useEffect(() => {
    if (url === undefined) {
      return;
    }

    navigate({
      routeName: ROUTES.CIE_CARD_READER_SCREEN,
      params: {
        ciePin: pin,
        authorizationUri: url
      }
    });

    hideModal();
  }, [url]);

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
        onSuccess={onProceedToCardReaderScreen}
      />,
      BottomTopAnimation
    );
  };

  const onPinChanged = (pin: string) => setPin(pin);

  useEffect(() => {
    if (pin === "") {
      return;
    }

    if (pin.length === CIE_PIN_LENGTH) {
      setAccessibilityFocus(continueButtonRef, 100 as Millisecond);
    }
  }, [pin]);

  const doSetAccessibilityFocus = useCallback(() => {
    if (!PINPadViewRef.current) {
      return;
    }

    setAccessibilityFocus(PINPadViewRef, 100 as Millisecond);
  }, [PINPadViewRef]);

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
        <View style={styles.container} accessible={true} ref={PINPadViewRef}>
          <CiePinpad
            pin={pin}
            pinLength={CIE_PIN_LENGTH}
            onPinChanged={onPinChanged}
            onSubmit={showModal}
          />
          <View spacer={true} />
          {isIos && (
            <AdviceComponent
              iconName={"io-bug"}
              text={I18n.t("global.disclaimer_beta")}
              iconColor={"black"}
            />
          )}
          <View spacer={true} />
          <AdviceComponent
            text={I18n.t("login.expiration_info")}
            iconColor={"black"}
          />
        </View>
      </ScrollView>
      {pin.length === CIE_PIN_LENGTH && (
        <FooterWithButtons
          accessible={true}
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
