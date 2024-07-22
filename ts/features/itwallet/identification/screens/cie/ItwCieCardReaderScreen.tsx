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
import { Platform, ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Cie } from "@pagopa/io-react-native-wallet";
import { useSelector } from "@xstate5/react";
import CieCardReadingAnimation, {
  ReadingState
} from "../../../../../components/cie/CieCardReadingAnimation";
import I18n from "../../../../../i18n";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../../../utils/accessibility";
import { isDevEnv } from "../../../../../utils/environment";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useInteractiveElementDefaultColorName } from "../../../../../utils/hooks/theme";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import {
  selectCieAuthUrlOption,
  selectCiePin
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";

// This can be any URL, as long as it has http or https as its protocol, otherwise it cannot be managed by the webview.
const CIE_L3_REDIRECT_URI = "https://cie.callback";

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

const accessibityTimeout = 100 as Millisecond;

type TextForState = {
  title: string;
  subtitle?: string;
  content: string;
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

export const ItwCieCardReaderScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ItwParamsList>>();

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const ciePin = useSelector(machineRef, selectCiePin);
  const cieAuthUrl = useSelector(machineRef, selectCieAuthUrlOption);

  const [readingState, setReadingState] = useState(ReadingState.waiting_card);

  const blueColorName = useInteractiveElementDefaultColorName();
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const { title, subtitle, content } = getTextForState(
    readingState,
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
      case Cie.CieErrorType.AUTHENTICATION_ERROR:
        navigation.navigate(ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR);
        break;
      case Cie.CieErrorType.NFC_ERROR:
      default:
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
            useUat={isDevEnv}
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
