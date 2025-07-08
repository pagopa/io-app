import {
  Body,
  ContentWrapper,
  H4,
  HStack,
  IOColors,
  IOSpringValues,
  Pictogram,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { trackItWalletCieCardReading } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  selectAuthUrlOption,
  selectCiePin
} from "../../../machine/eid/selectors";
import {
  ItwCieMachineContext,
  ItwCieMachineProvider
} from "../../machine/cie/provider";
import {
  selectCurrentState,
  selectReadProgress
} from "../../machine/cie/selectors";

export const ItwCieCardReaderL3Screen = () => {
  const pin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const authUrl = ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);

  useFocusEffect(trackItWalletCieCardReading);

  useHeaderSecondLevel({ title: "", canGoBack: false });

  if (O.isNone(authUrl)) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

  return (
    <ItwCieMachineProvider pin={pin} authenticationUrl={authUrl.value}>
      <ItwCieCardReaderScreenContent />
    </ItwCieMachineProvider>
  );
};

const ItwCieCardReaderScreenContent = () => {
  const currentState = ItwCieMachineContext.useSelector(selectCurrentState);

  switch (currentState) {
    case "ReadingCard":
      return Platform.select({
        ios: <CardReadProgressContentIOs />,
        default: <CardReadProgressContentAndroid />
      });
    case "Authorizing":
      return <Body>Authorizing</Body>;
    case "Failure":
      return <Body>Failure</Body>;
    default:
      return (
        <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
      );
  }
};

const CardReadProgressContentAndroid = () => (
  <ScrollView centerContent={true}>
    <ContentWrapper />
  </ScrollView>
);

const CardReadProgressContentIOs = () => {
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  const { title, subtitle } = useMemo(() => {
    const status =
      readProgress <= 0 ? "idle" : readProgress < 100 ? "reading" : "completed";

    return {
      title: I18n.t(
        `features.itWallet.identification.cie.readingCard.ios.${status}.title`
      ),
      subtitle: I18n.t(
        `features.itWallet.identification.cie.readingCard.ios.${status}.subtitle`,
        {
          defaultValue: ""
        }
      )
    };
  }, [readProgress]);

  return (
    <ContentWrapper>
      <VStack>
        <ReadProgressBar progress={readProgress} />
        <HStack space={32} style={{ alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <H4>{title}</H4>
            <Body color="grey-650">{subtitle}</Body>
          </View>
          <Pictogram
            name={readProgress < 100 ? "nfcScaniOS" : "success"}
            size={120}
          />
        </HStack>
      </VStack>
    </ContentWrapper>
  );
};

type ReadProgressBarProps = {
  progress: number;
};

export const ReadProgressBar = ({ progress }: ReadProgressBarProps) => {
  const theme = useIOTheme();
  const [width, setWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  const backgroundColor = IOColors["grey-200"];
  const foregroundColor = IOColors["turquoise-500"];

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progressWidth.value = withSpring(
      (progress / 100) * width,
      IOSpringValues.accordion
    );
  }, [progressWidth, progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value
  }));

  return (
    <View
      focusable
      /* We set a fixed height to make the component focusable on Android */
      style={{
        width: "100%",
        height: 4,
        justifyContent: "center",
        borderRadius: 4,
        backgroundColor
      }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      importantForAccessibility="yes"
      accessibilityLabel={`${progress * 1000}%`}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          { height: 4, backgroundColor: foregroundColor, borderRadius: 4 }
        ]}
      />
    </View>
  );
};
