import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  IOColors,
  IOPictograms,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as O from "fp-ts/lib/Option";
import { memo, useCallback, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../../../utils/accessibility";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../../authentication/login/cie/components/CieCardReadingAnimation";
import {
  ItwFlow,
  trackItWalletCieCardReading,
  trackItWalletCieCardReadingFailure,
  trackItWalletCieCardReadingSuccess,
  trackItWalletErrorCardReading
} from "../../../analytics";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import {
  isL3FeaturesEnabledSelector,
  selectAuthUrlOption,
  selectCiePin,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as Cie from "../../components/cie";

// the timeout we sleep until move to consent form screen when authentication goes well
const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;
const accessibityTimeout = 100 as Millisecond;

enum IdentificationStep {
  AUTHENTICATION,
  CONSENT
}

const cieEventsMap: Record<Cie.CieEvent, ReadingState> = {
  [Cie.CieEvent.waiting_card]: ReadingState.waiting_card,
  [Cie.CieEvent.reading]: ReadingState.reading,
  [Cie.CieEvent.completed]: ReadingState.completed
};

type TextForState = {
  title: string;
  subtitle?: string;
  content: string;
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

// some texts changes depending on current running Platform
const getTextForState = (
  state: ReadingState,
  isScreenReaderEnabled: boolean,
  errorMessage: string = ""
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

const getMixpanelHandler = (
  state: ReadingState,
  itw_flow: ItwFlow
): ((...args: Array<unknown>) => void) => {
  const events: Record<ReadingState, (...args: Array<unknown>) => void> = {
    [ReadingState.waiting_card]: () => null,
    [ReadingState.reading]: () => null,
    [ReadingState.completed]: () => null,
    [ReadingState.error]: () => trackItWalletErrorCardReading(itw_flow)
  };
  return events[state];
};

const LoadingSpinner = (
  <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
);

export const ItwCieCardReaderScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ItwParamsList>>();
  const env = useIOSelector(selectItwEnv);
  const { ISSUANCE_REDIRECT_URI } = getEnv(env);
  const isL3Enabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const itw_flow = isL3Enabled ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItWalletCieCardReading(itw_flow);
    }, [itw_flow])
  );

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const ciePin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const cieAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);

  const [identificationStep, setIdentificationStep] = useState(
    IdentificationStep.AUTHENTICATION
  );
  const [readingState, setReadingState] = useState<ReadingState>();

  const theme = useIOTheme();
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" })
  });

  const handleAccessibilityAnnouncement = (
    event: Cie.CieEvent | Cie.CieError
  ) => {
    const { content } =
      event instanceof Cie.CieError
        ? getTextForState(
            ReadingState.error,
            isScreenReaderEnabled,
            event.message
          )
        : getTextForState(cieEventsMap[event], isScreenReaderEnabled);
    if (content) {
      AccessibilityInfo.announceForAccessibility(content);
    }
  };

  const handleCieReadEvent = (event: Cie.CieEvent) => {
    setReadingState(cieEventsMap[event]);
    handleAccessibilityAnnouncement(event);
    // Wait a few seconds before showing the consent web view to display the success message
    if (event === Cie.CieEvent.completed) {
      trackItWalletCieCardReadingSuccess(itw_flow);
      setTimeout(
        () => {
          setIdentificationStep(IdentificationStep.CONSENT);
        },
        isScreenReaderEnabled
          ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY // If screen reader is enabled, give more time to read the success message
          : Platform.select({ ios: 0, default: WAIT_TIMEOUT_NAVIGATION }) // Don't wait on iOS: the thank you page is shown natively
      );
    }
  };

  const handleCieReadError = (error: Cie.CieError) => {
    handleAccessibilityAnnouncement(error);

    switch (error.type) {
      case Cie.CieErrorType.WEB_VIEW_ERROR:
        break;
      case Cie.CieErrorType.NFC_ERROR:
        if (error.message === "APDU not supported") {
          trackItWalletCieCardReadingFailure({
            reason: error.message,
            itw_flow
          });
        }
        setReadingState(ReadingState.error);
        break;
      case Cie.CieErrorType.PIN_LOCKED:
      case Cie.CieErrorType.PIN_ERROR:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN, {
          remainingCount: error.attemptsLeft ?? 0
        });
        break;
      case Cie.CieErrorType.TAG_NOT_VALID:
        trackItWalletCieCardReadingFailure({
          reason: "unknown card",
          itw_flow
        });
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD);
        break;
      case Cie.CieErrorType.CERTIFICATE_ERROR:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN);
        break;
      case Cie.CieErrorType.GENERIC:
      case Cie.CieErrorType.AUTHENTICATION_ERROR:
      default:
        trackItWalletCieCardReadingFailure({ reason: "KO", itw_flow });
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR);
        break;
    }
  };

  const handleCieReadSuccess = (url: string) => {
    machineRef.send({
      type: "user-identification-completed",
      authRedirectUrl: url
    });
  };

  if (isMachineLoading) {
    return LoadingSpinner;
  }

  const renderCardReaderFooter = () => (
    <View style={{ alignItems: "center" }}>
      <View>
        <IOButton
          variant="link"
          label={I18n.t("global.buttons.close")}
          onPress={dismissalDialog.show}
        />
      </View>
    </View>
  );

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const renderCardReaderContent = (readingState: ReadingState) => {
    // Since the CIE web view needs to be mounted all the time, hide the card reader content
    // after it is not longer needed and the user is giving consent on the web view.
    if (identificationStep === IdentificationStep.CONSENT) {
      return null;
    }

    const { title, subtitle } = getTextForState(
      readingState,
      isScreenReaderEnabled
    );

    getMixpanelHandler(readingState, itw_flow)();

    return (
      <ScrollView
        centerContent={true}
        contentContainerStyle={styles.contentContainer}
      >
        <ContentWrapper>
          <CieCardReadingAnimation
            pictogramName={getPictogramName(readingState)}
            readingState={readingState}
            circleColor={IOColors[theme["interactiveElem-default"]]}
          />
          <VSpacer size={32} />
          <Title
            text={title}
            accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
          />
          <VSpacer size={8} />
          {subtitle ? <Body style={styles.centerText}>{subtitle}</Body> : null}
          <VSpacer size={24} />
          {readingState !== ReadingState.completed
            ? renderCardReaderFooter()
            : null}
        </ContentWrapper>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={
          identificationStep === IdentificationStep.CONSENT
            ? { width: "100%", height: "100%" }
            : { width: "0%", height: "0%" }
        }
      >
        {O.isSome(cieAuthUrl) ? (
          <Cie.WebViewComponent
            authUrl={cieAuthUrl.value}
            pin={ciePin}
            useUat={env === "pre"}
            onEvent={handleCieReadEvent}
            onSuccess={handleCieReadSuccess}
            onError={handleCieReadError}
            redirectUrl={ISSUANCE_REDIRECT_URI}
          />
        ) : null}
      </View>
      {
        // When the card is ready the CIE SDK will send the waiting_card state
        // Wait for it before showing the user the card reading screen
        readingState ? renderCardReaderContent(readingState) : LoadingSpinner
      }
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
