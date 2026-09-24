import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  IOButtonBlockSpecificProps,
  IOButtonLinkSpecificProps,
  IOColors,
  IOPictograms,
  IOPictogramSizeScale,
  Pictogram,
  useIOTheme,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { CircularProgress } from "../../../../../components/ui/CircularProgress";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { accessibityTimeout } from "../../../common/utils/constants";

export type OneIdentityCieCardReaderProgressContentProps = {
  content?: string;
  pictogram: IOPictograms;
  primaryAction?: Omit<IOButtonBlockSpecificProps, "variant">;
  secondaryAction?: Omit<IOButtonLinkSpecificProps, "variant">;
  status: OneIdentityCieCardReaderContentStatus;
  subtitle?: string;
  title: string;
};

type OneIdentityCieCardReaderContentStatus =
  | "error"
  | "idle"
  | "reading"
  | "success";

export const OneIdentityCieCardReaderProgressContent = ({
  status,
  pictogram,
  title,
  subtitle,
  content,
  primaryAction,
  secondaryAction
}: OneIdentityCieCardReaderProgressContentProps) => {
  useEffect(() => {
    if (content) {
      AccessibilityInfo.announceForAccessibility(content);
    }
  }, [content]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} testID="cie-card-reader-screen-test-id">
        <ScrollView
          centerContent={true}
          contentContainerStyle={styles.contentContainer}
        >
          <ContentWrapper>
            <ReaderAnimation pictogram={pictogram} status={status} />
            <VSpacer size={32} />
            <VStack space={8}>
              <Title title={title} />
              <Subtitle subtitle={subtitle} />
            </VStack>
            <VSpacer size={24} />
            <Actions
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
            />
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Title = ({
  title
}: Pick<OneIdentityCieCardReaderProgressContentProps, "title">) => {
  const titleRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      if (!titleRef.current && Platform.OS === "android") {
        setAccessibilityFocus(titleRef, accessibityTimeout);
      }
    }, [])
  );

  return (
    <View ref={titleRef}>
      <H3 style={styles.centerText}>{title}</H3>
    </View>
  );
};

const Subtitle = ({
  subtitle
}: Pick<OneIdentityCieCardReaderProgressContentProps, "subtitle">) => {
  if (subtitle === undefined) {
    return null;
  }
  return <Body style={styles.centerText}>{subtitle}</Body>;
};

const Actions = ({
  primaryAction,
  secondaryAction
}: Pick<
  OneIdentityCieCardReaderProgressContentProps,
  "primaryAction" | "secondaryAction"
>) =>
  Platform.select({
    ios: (
      <View style={{ alignItems: "center" }}>
        <VStack space={24}>
          {primaryAction ? (
            <IOButton {...primaryAction} variant="solid" />
          ) : null}
          {secondaryAction ? (
            <IOButton {...secondaryAction} variant="link" />
          ) : null}
        </VStack>
      </View>
    ),
    default: (
      <View style={{ alignItems: "center" }}>
        {primaryAction ? <IOButton {...primaryAction} variant="solid" /> : null}
      </View>
    )
  });

// Image dimension
const imgSize: IOPictogramSizeScale = 180;
const progressThreshold = 60;
const circleBorderWidth = 3;

const ReaderAnimation = ({
  status,
  pictogram
}: Pick<
  OneIdentityCieCardReaderProgressContentProps,
  "pictogram" | "status"
>) => {
  const [progressBarValue, setProgressBarValue] = useState(0);

  const theme = useIOTheme();
  const circleColor = IOColors[theme["interactiveElem-default"]];

  const progress = useSharedValue(0);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        scheduleOnRN(setProgressBarValue, currentValue);
      }
    },
    [progress]
  );

  useEffect(() => {
    // If the status is not 'reading' (e.g., idle, success, error),
    // we stop any ongoing animation and set the static final value.
    if (status !== "reading") {
      cancelAnimation(progress);
      progress.value = status === "success" ? 100 : 0;
      return;
    }
    // Reset progress before starting the animation loop
    progress.value = 0;
    // Define and start the animation sequence
    progress.value = withRepeat(
      withSequence(
        // First phase: progress to 'progressThreshold' (e.g., 60%) in 8 seconds
        withTiming(progressThreshold, {
          duration: 8000,
          easing: Easing.linear
        }),
        // Second phase: complete the remaining progress to 100% in 10 seconds
        withTiming(100, {
          duration: 10000,
          easing: Easing.linear
        })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [status, progress]);

  return (
    <View accessible={false} style={{ alignSelf: "center" }}>
      <CircularProgress
        progress={status === "success" ? 100 : progressBarValue}
        radius={imgSize / 2}
        size={imgSize}
        strokeBgColor={IOColors["grey-100"]}
        strokeColor={status === "error" ? IOColors["grey-100"] : circleColor}
        strokeWidth={circleBorderWidth}
      >
        <View style={styles.imgTranslated}>
          <Pictogram name={pictogram} size={"100%"} />
        </View>
      </CircularProgress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centerText: {
    textAlign: "center"
  },
  contentContainer: {
    flexGrow: 1,
    alignContent: "center",
    justifyContent: "center"
  },
  imgTranslated: {
    height: imgSize + 30,
    width: imgSize + 30,
    paddingStart: 15,
    paddingTop: 25
  }
});
