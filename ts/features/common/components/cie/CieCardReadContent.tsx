import {
  Body,
  ContentWrapper,
  H3,
  H4,
  HStack,
  IOButton,
  IOButtonBlockSpecificProps,
  IOButtonLinkSpecificProps,
  IOColors,
  IOPictograms,
  IOSpringValues,
  Pictogram,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { CircularProgress } from "../../../../components/ui/CircularProgress";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { isDevEnv } from "../../../../utils/environment";
import { platformSelect } from "../../utils";

export type CieCardReadContentProps = {
  progress?: number;
  title: string;
  subtitle?: string;
  pictogram: IOPictograms;
  primaryAction?: Omit<IOButtonBlockSpecificProps, "variant">;
  secondaryAction?: Omit<IOButtonLinkSpecificProps, "variant">;
  /**
   * @platform iOS
   */
  hiddenProgressBar?: boolean;
};

/**
 * Renders the title component title based on the platform
 */
const Title = ({ title }: Pick<CieCardReadContentProps, "title">) => (
  <View>
    {/* A11y live node */}
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={title}
      style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      importantForAccessibility="yes"
    />
    {platformSelect({
      ios: <H4>{title}</H4>,
      default: <H3 style={{ textAlign: "center" }}>{title}</H3>
    })}
  </View>
);

/**
 * Renders the component subtitle based on the platform and progress
 */
const Subtitle = ({ subtitle }: Pick<CieCardReadContentProps, "subtitle">) => {
  if (subtitle === undefined) {
    return null;
  }
  return platformSelect({
    ios: <Body color="grey-650">{subtitle}</Body>,
    default: (
      <Body color="grey-650" style={{ textAlign: "center" }}>
        {subtitle}
      </Body>
    )
  });
};

/**
 * Renders the content actions (Android) or footer actions (iOS)
 */
const Actions = (
  props: Pick<CieCardReadContentProps, "primaryAction" | "secondaryAction">
) =>
  platformSelect({
    ios: (
      <VStack space={16}>
        {props.primaryAction ? (
          <IOButton {...props.primaryAction} variant="solid" fullWidth={true} />
        ) : null}
        {props.secondaryAction ? (
          <View style={{ alignSelf: "center" }}>
            <IOButton {...props.secondaryAction} variant="link" />
          </View>
        ) : null}
      </VStack>
    ),
    default: (
      <VStack space={24}>
        {props.primaryAction && (
          <View style={{ alignItems: "center" }}>
            <View>
              <IOButton variant="solid" {...props.primaryAction} />
            </View>
          </View>
        )}
        {props.secondaryAction && (
          <View style={{ alignItems: "center" }}>
            <View>
              <IOButton variant="link" {...props.secondaryAction} />
            </View>
          </View>
        )}
      </VStack>
    )
  });

/**
 * Custom progress bar for read progress visualization on iOS
 * TODO: use ProgressLoader from the DS
 * @param props.progress - Progress value from 0 to 1
 */
const LinearProgressBar = (
  props: Pick<CieCardReadContentProps, "progress">
) => {
  const { progress = 0 } = props;
  const [width, setWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  const backgroundColor = IOColors["grey-200"];
  const foregroundColor = IOColors["turquoise-500"];

  // Convert progress to 0-100 scale and round to avoid floating-point precision issues
  const progressPercent = Math.round(
    Math.max(Math.min(progress, 1.0), 0) * 100
  );

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progressWidth.value = withSpring(
      Math.round((progressPercent * width) / 100),
      IOSpringValues.accordion
    );
  }, [progressWidth, progressPercent, width]);

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
      accessibilityLabel={`${progressPercent}%`}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progressPercent
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

const ContentIos = (props: CieCardReadContentProps) => (
  <ContentWrapper style={{ flex: 1 }}>
    <VSpacer size={32} />
    <VStack space={16} style={{ flex: 1 }}>
      {!props.hiddenProgressBar && (
        <LinearProgressBar progress={props.progress} />
      )}
      <HStack space={32}>
        <View style={{ flex: 1, paddingVertical: 8, gap: 4 }}>
          <Title title={props.title} />
          <Subtitle subtitle={props.subtitle} />
        </View>
        <Pictogram name={props.pictogram} size={120} />
      </HStack>
    </VStack>
    <Actions
      primaryAction={props.primaryAction}
      secondaryAction={props.secondaryAction}
    />
  </ContentWrapper>
);

const ContentAndroid = (props: CieCardReadContentProps) => {
  const announceStep = 30;
  const lastAnnouncedRef = useRef<number | null>(null);

  const progressPercent = Math.round(
    Math.max(Math.min(props.progress ?? 0, 1.0), 0) * 100
  );

  useEffect(() => {
    const stepped = Math.floor(progressPercent / announceStep) * announceStep;

    if (lastAnnouncedRef.current === stepped) {
      return;
    }

    // eslint-disable-next-line functional/immutable-data
    lastAnnouncedRef.current = stepped;

    AccessibilityInfo.announceForAccessibility(`${stepped}%`);
  }, [progressPercent]);

  return (
    <IOScrollView centerContent>
      <ContentWrapper>
        <VStack space={24}>
          <CircularProgress
            size={240}
            radius={120}
            progress={(props.progress || 0) * 100}
            strokeColor={IOColors["blueIO-500"]}
            strokeBgColor={IOColors["grey-200"]}
            strokeWidth={4}
          >
            <Pictogram size={180} name={props.pictogram} />
          </CircularProgress>
          <VStack space={8}>
            <Title title={props.title} />
            <Subtitle subtitle={props.subtitle} />
          </VStack>
          <Actions
            primaryAction={props.primaryAction}
            secondaryAction={props.secondaryAction}
          />
        </VStack>
      </ContentWrapper>
    </IOScrollView>
  );
};

/**
 * Renders the read progress screen content based on the platform.
 * It is fully customizable via props and it is used as base component to display the
 * reading, failure and success states for the CIE manager flow.
 */
export const CieCardReadContent = platformSelect({
  ios: ContentIos,
  default: ContentAndroid
});

export const testable = isDevEnv
  ? {
      ContentIos,
      ContentAndroid
    }
  : undefined;
