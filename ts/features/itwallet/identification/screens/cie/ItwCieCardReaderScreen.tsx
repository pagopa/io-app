/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import {
  ButtonLink,
  ContentWrapper,
  H3,
  IOColors,
  IOPictograms,
  IOStyles,
  VSpacer,
  Body
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, {
  createRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  Text,
  Vibration,
  View,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Cie } from "@pagopa/io-react-native-wallet";
import { useSelector } from "@xstate5/react";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../../../components/cie/CieCardReadingAnimation";
import { isCieLoginUatEnabledSelector } from "../../../../../features/cieLogin/store/selectors";
import { getCieUatEndpoint } from "../../../../../features/cieLogin/utils/endpoints";
import I18n from "../../../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  CieAuthenticationErrorPayload,
  CieAuthenticationErrorReason,
  cieAuthenticationError
} from "../../../../../store/actions/cie";
import { ReduxProps } from "../../../../../store/actions/types";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import {
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingError,
  trackLoginCieCardReadingSuccess
} from "../../../../../screens/authentication/analytics/cieAnalytics"; // TODO: separate cie analytics?
import { ITW_ROUTES } from "../../../navigation/routes";
import { useInteractiveElementDefaultColorName } from "../../../../../utils/hooks/theme";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import {
  selectCieAuthUrlOption,
  selectCiePin
} from "../../../machine/eid/selectors";

// This can be any URL, as long as it has http or https as its protocol, otherwise it cannot be managed by the webview.
const CIE_L3_REDIRECT_URI = "https://cie.callback";

export type CieCardReaderScreenNavigationParams = {
  ciePin: string;
  authorizationUri: string;
};

export type CieCardReaderNavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_CIE_CARD_READER_SCREEN"
>;

enum FlowStep {
  AUTHENTICATION,
  CONSENT
}

type State = {
  // Get the current status of the card reading
  readingState: ReadingState;
  title: string;
  subtitle?: string;
  content?: string;
  errorMessage?: string;
  isScreenReaderEnabled: boolean;
};

type setErrorParameter = {
  eventReason: CieAuthenticationErrorReason;
  errorDescription?: string;
  navigation?: () => void;
};

const getPictogramName = (state: ReadingState): IOPictograms => {
  switch (state) {
    default:
    case ReadingState.reading:
    case ReadingState.waiting_card:
      return Platform.select({
        ios: "nfcScaniOS",
        default: "nfcScanAndroid"
      });
    case ReadingState.error:
      return "empty";
    case ReadingState.completed:
      return "success";
  }
};

// A subset of Cie Events (errors) which is of interest to analytics
const analyticActions = new Map<CieAuthenticationErrorReason, string>([
  // Reading interrupted before the sdk complete the reading
  ["Transmission Error", I18n.t("authentication.cie.card.error.onTagLost")],
  ["ON_TAG_LOST", I18n.t("authentication.cie.card.error.onTagLost")],
  [
    "TAG_ERROR_NFC_NOT_SUPPORTED",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  [
    "ON_TAG_DISCOVERED_NOT_CIE",
    I18n.t("authentication.cie.card.error.unknownCardContent")
  ],
  ["PIN Locked", I18n.t("authentication.cie.card.error.generic")],
  ["ON_CARD_PIN_LOCKED", I18n.t("authentication.cie.card.error.generic")],
  ["ON_PIN_ERROR", I18n.t("authentication.cie.card.error.tryAgain")],
  ["PIN_INPUT_ERROR", ""],
  ["CERTIFICATE_EXPIRED", I18n.t("authentication.cie.card.error.generic")],
  ["CERTIFICATE_REVOKED", I18n.t("authentication.cie.card.error.generic")],
  ["AUTHENTICATION_ERROR", I18n.t("authentication.cie.card.error.generic")],
  [
    "EXTENDED_APDU_NOT_SUPPORTED",
    I18n.t("authentication.cie.nfc.apduNotSupported")
  ],
  [
    "ON_NO_INTERNET_CONNECTION",
    I18n.t("authentication.cie.card.error.tryAgain")
  ],
  ["STOP_NFC_ERROR", ""],
  ["START_NFC_ERROR", ""]
]);

// the timeout we sleep until move to consent form screen when authentication goes well
const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
const VIBRATION = 100 as Millisecond;
const accessibityTimeout = 100 as Millisecond;

type TextForState = {
  title: string;
  subtitle?: string;
  content: string;
};

// some texts changes depending on current running Platform
const getTextForState = (
  state: ReadingState,
  errorMessage: string = "",
  isScreenReaderEnabled?: boolean
): TextForState => {
  const texts: Record<ReadingState, TextForState> = {
    [ReadingState.waiting_card]: Platform.select({
      ios: {
        title: I18n.t("authentication.cie.card.titleiOS"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeaderiOS"),
        content: "" // the native alert hides the screen content and shows a message itself
      },
      default: {
        title: I18n.t("authentication.cie.card.title"),
        subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
        content: I18n.t("authentication.cie.card.layCardMessageFooter")
      }
    }),
    [ReadingState.reading]: {
      title: I18n.t("authentication.cie.card.readerCardTitle"),
      subtitle: "",
      content: I18n.t("authentication.cie.card.readerCardFooter")
    },
    [ReadingState.completed]: {
      title: I18n.t("authentication.cie.card.cieCardValid"),
      subtitle: "",
      // duplicate message so screen reader can read the updated message
      content: isScreenReaderEnabled
        ? I18n.t("authentication.cie.card.cieCardValid")
        : ""
    },
    [ReadingState.error]: Platform.select({
      ios: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: "",
        content: "" // the native alert hides the screen content and shows a message itself
      },
      default: {
        title: I18n.t("authentication.cie.card.error.readerCardLostTitle"),
        subtitle: I18n.t("authentication.cie.card.error.onTagLost"),
        content: errorMessage
      }
    })
  };
  return texts[state];
};

export const ItwCieCardReaderScreen = () => {
  const navigation = useIONavigation();

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const ciePin = useSelector(machineRef, selectCiePin);
  const cieAuthUrl = useSelector(machineRef, selectCieAuthUrlOption);

  const [readingState, setReadingState] = useState(ReadingState.waiting_card);

  const blueColorName = useInteractiveElementDefaultColorName();
  const isCieUat = true; // useIOSelector(isCieLoginUatEnabledSelector);
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const { title, subtitle, content } = getTextForState(
    readingState,
    "",
    isScreenReaderEnabled
  );

  const handleCancel = () => machineRef.send({ type: "close" });

  const handleCieReadEvent = (event: Cie.CieEvent) => {
    switch (event) {
      case Cie.CieEvent.waiting_card: {
        setReadingState(ReadingState.waiting_card);
        break;
      }
      case Cie.CieEvent.reading: {
        setReadingState(ReadingState.reading);
        break;
      }
      case Cie.CieEvent.completed: {
        setReadingState(ReadingState.completed);
        break;
      }
    }
  };

  const handleCieReadError = (error: Cie.CieError) => {
    switch (error.type) {
      case Cie.CieErrorType.PIN_LOCKED:
      case Cie.CieErrorType.PIN_ERROR:
        navigation.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN,
          params: { remainingCount: error.attemptsLeft ?? 0 }
        });
        break;
      case Cie.CieErrorType.TAG_NOT_VALID:
        navigation.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD
        });
        break;
      case Cie.CieErrorType.CERTIFICATE_ERROR:
        navigation.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN
        });
        break;
      case Cie.CieErrorType.AUTHENTICATION_ERROR:
        navigation.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR
        });
        break;
      case Cie.CieErrorType.NFC_ERROR:
        setReadingState(ReadingState.error);
    }
  };

  const handleCieReadSuccess = (url: string) => {
    machineRef.send({ type: "cie-identification-completed", url });
  };

  const renderCardReaderContent = () => {
    // Since the CIE web view needs to be mounted all the time, hide the card reader content
    // after it is not longer needed and the user is giving consent on the web view.
    if (readingState === ReadingState.completed) {
      return null;
    }

    return (
      <ScrollView
        centerContent={true}
        contentContainerStyle={styles.contentContainer}
      >
        <ContentWrapper>
          <CieCardReadingAnimation
            pictogramName={getPictogramName(readingState)}
            readingState={readingState}
            circleColor={blueColorName}
          />
          <VSpacer size={32} />
          <Title
            text={title}
            accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
          />
          <VSpacer size={8} />
          {subtitle ? <Body style={styles.centerText}>{subtitle}</Body> : null}
          <VSpacer size={24} />
          <View style={IOStyles.alignCenter}>
            <View>
              <ButtonLink
                label={I18n.t("global.buttons.close")}
                onPress={handleCancel}
              />
            </View>
          </View>
        </ContentWrapper>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={
          readingState === ReadingState.completed
            ? { width: "100%", height: "100%" }
            : { width: "0%", height: "0%" }
        }
      >
        {O.isSome(cieAuthUrl) ? (
          <Cie.WebViewComponent
            authUrl={cieAuthUrl.value}
            pin={ciePin}
            useUat={isCieUat}
            onEvent={handleCieReadEvent}
            onSuccess={handleCieReadSuccess}
            onError={handleCieReadError}
            redirectUrl={CIE_L3_REDIRECT_URI}
          />
        ) : null}
      </View>
      {renderCardReaderContent()}
    </SafeAreaView>
  );
};

const Title = memo((props: { text: string; accessibilityLabel: string }) => {
  const titleRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      if (!titleRef.current && Platform.OS === "android") {
        setAccessibilityFocus(titleRef, accessibityTimeout);
      }
    }, [])
  );

  return (
    <View accessible ref={titleRef}>
      <H3 style={styles.centerText}>{props.text}</H3>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  centerText: {
    textAlign: "center"
  },
  contentContainer: {
    flexGrow: 1,
    alignContent: "center",
    justifyContent: "center"
  }
});
