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
import React, { memo, useCallback, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  View,
  StyleSheet,
  AccessibilityInfo
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Cie } from "@pagopa/io-react-native-wallet";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../../../components/cie/CieCardReadingAnimation";
import I18n from "../../../../../i18n";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../../../utils/accessibility";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useInteractiveElementDefaultColorName } from "../../../../../utils/hooks/theme";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import {
  selectCieAuthUrlOption,
  selectCiePin,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { itwIdpHintTest } from "../../../../../config";

// This can be any URL, as long as it has http or https as its protocol, otherwise it cannot be managed by the webview.
const CIE_L3_REDIRECT_URI = "https://wallet.io.pagopa.it/index.html";
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

const LoadingSpinner = (
  <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
);

export const ItwCieCardReaderScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ItwParamsList>>();

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const ciePin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const cieAuthUrl = ItwEidIssuanceMachineContext.useSelector(
    selectCieAuthUrlOption
  );

  const [identificationStep, setIdentificationStep] = useState(
    IdentificationStep.AUTHENTICATION
  );
  const [readingState, setReadingState] = useState<ReadingState>();
  const [webViewVisible, setWebViewVisible] = useState(true);

  const blueColorName = useInteractiveElementDefaultColorName();
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const handleCancel = () => machineRef.send({ type: "close" });

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
        setReadingState(ReadingState.error);
        break;
      case Cie.CieErrorType.PIN_LOCKED:
      case Cie.CieErrorType.PIN_ERROR:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN, {
          remainingCount: error.attemptsLeft ?? 0
        });
        break;
      case Cie.CieErrorType.TAG_NOT_VALID:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD);
        break;
      case Cie.CieErrorType.CERTIFICATE_ERROR:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN);
        break;
      case Cie.CieErrorType.GENERIC:
      case Cie.CieErrorType.AUTHENTICATION_ERROR:
      default:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR);
        break;
    }
  };

  const handleCieReadSuccess = (url: string) => {
    setWebViewVisible(false); // Try to hide the error page because the callback url is fake
    machineRef.send({ type: "cie-identification-completed", url });
  };

  if (isMachineLoading) {
    return LoadingSpinner;
  }

  const renderCardReaderFooter = () => (
    <View style={IOStyles.alignCenter}>
      <View>
        <ButtonLink
          label={I18n.t("global.buttons.close")}
          onPress={handleCancel}
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
          webViewVisible && identificationStep === IdentificationStep.CONSENT
            ? { width: "100%", height: "100%" }
            : { width: "0%", height: "0%" }
        }
      >
        {O.isSome(cieAuthUrl) ? (
          <Cie.WebViewComponent
            authUrl={cieAuthUrl.value}
            pin={ciePin}
            useUat={itwIdpHintTest}
            onEvent={handleCieReadEvent}
            onSuccess={handleCieReadSuccess}
            onError={handleCieReadError}
            redirectUrl={CIE_L3_REDIRECT_URI}
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
