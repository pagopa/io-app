import {
  Body,
  ContentWrapper,
  H3,
  H4,
  HStack,
  IOColors,
  IOSpringValues,
  Pictogram,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { Platform, ScrollView, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { selectReadProgress } from "../machine/cie/selectors";
import { ItwCieMachineContext } from "../machine/cie/provider";
import I18n from "../../../../i18n";
import { setAccessibilityFocus } from "../../../../utils/accessibility";

const accessibityTimeout = 100 as Millisecond;

// Mobile only platforms
const platform = Platform.select({
  ios: "ios" as const,
  default: "android" as const
});

/**
 * Renders the component title based on the platform and progress
 */
const Title = () => {
  const titleRef = useRef<View>(null);
  const readState = useReadState();
  const title = I18n.t(
    `features.itWallet.identification.cie.readingCard.${platform}.${readState}.title`
  );

  useFocusEffect(
    useCallback(() => {
      if (!titleRef.current && Platform.OS === "android") {
        setAccessibilityFocus(titleRef, accessibityTimeout);
      }
    }, [])
  );

  return (
    <View accessible ref={titleRef}>
      {Platform.select({
        ios: <H4>{title}</H4>,
        default: <H3 style={{ textAlign: "center" }}>{title}</H3>
      })}
    </View>
  );
};

/**
 * Renders the component subtitle based on the platform and progress
 */
const Subtitle = () => {
  const readState = useReadState();
  const subtitle = I18n.t(
    `features.itWallet.identification.cie.readingCard.${platform}.${readState}.subtitle`,
    {
      defaultValue: "" // Not all states have a subtitle
    }
  );

  if (subtitle.length === 0) {
    return null;
  }

  return <Body color="grey-650">{subtitle}</Body>;
};

const ContentIos = () => {
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  return (
    <ContentWrapper>
      <VSpacer size={32} />
      <VStack space={16}>
        <ReadProgressBar progress={readProgress} />
        <HStack space={32}>
          <View style={{ flex: 1, paddingVertical: 8, gap: 4 }}>
            <Title />
            <Subtitle />
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

const ContentAndroid = () => {
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  return (
    <ScrollView centerContent={true}>
      <ContentWrapper />
    </ScrollView>
  );
};

/**
 * Custom progress bar for read progress visualization on iOS
 * TODO: use ProgressLoader from the DS
 * @param props.progress - Progress value from 0 to 1
 */
export const ReadProgressBar = (props: { progress: number }) => {
  const { progress } = props;
  const [width, setWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  const backgroundColor = IOColors["grey-200"];
  const foregroundColor = IOColors["turquoise-500"];

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progressWidth.value = withSpring(
      progress * width,
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

/**
 * Convenience hook that transforms read progress to a read state:
 * - x <= 0: idle
 * - 0 < x < 1: reading
 * - x >= 1: success
 */
const useReadState = () => {
  const progress = ItwCieMachineContext.useSelector(selectReadProgress);
  return progress <= 0 ? "idle" : progress < 1 ? "reading" : "completed";
};

/**
 * Returns the read progress screen content based on the current platform
 */
export const ItwCieCardReadProgressContent = Platform.select({
  ios: () => <ContentIos />,
  default: () => <ContentAndroid />
});
