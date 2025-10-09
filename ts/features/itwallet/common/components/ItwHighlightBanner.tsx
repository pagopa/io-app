import {
  Badge,
  ButtonLink,
  ButtonSolid,
  H4,
  HStack,
  IOColors,
  LabelMini,
  VStack,
  WithTestID,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import {
  Blend,
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { TxtParagraphNode, TxtStrongNode } from "@textlint/ast-node-types";
import { useEffect, useMemo, useState } from "react";
import { AccessibilityRole, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import I18n from "i18next";
import HighlightImage from "../../../../../img/features/itWallet/l3/highlight.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { itwGradientColors } from "../utils/constants.ts";

type Props = {
  title: string;
  description: string;
  action: string;
  onPress: () => void;
  // A11y related props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  // Variant props
  size?: "small" | "large";
};

export const ItwHighlightBanner = (props: WithTestID<Props>) => {
  const { testID, onPress, size = "large" } = props;

  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("slight");

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      shadowRadius: scale * 10,
      elevation: scale * 5,
      shadowOpacity: scale * 0.15
    };
  });

  if (size === "small") {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessible={true}
        accessibilityRole="button"
      >
        <Animated.View
          style={[styles.container, scaleAnimatedStyle, shadowAnimatedStyle]}
        >
          <BackgroundGradient />
          <StaticContent {...props} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={styles.container}
      // A11y related props
      accessible={true}
      accessibilityRole="button"
      onAccessibilityTap={onPress}
    >
      <BackgroundGradient />
      <StaticContent {...props} />
    </View>
  );
};

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progress.value = withRepeat(
      withTiming(1, { duration: 30000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  return (
    <View
      style={styles.gradient}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={width} height={height} r={16}>
          <Blend mode="lighten">
            <AnimatedLinearGradient
              progress={progress}
              width={width}
              height={height}
              rangeFactor={0.5}
            />
            <AnimatedLinearGradient
              progress={progress}
              width={width}
              height={height}
              rangeFactor={1.5}
              reverse={true}
            />
          </Blend>
        </RoundedRect>
      </Canvas>
    </View>
  );
};

type AnimatedLinearGradientProps = {
  progress: SharedValue<number>;
  width: number;
  height: number;
  rangeFactor: number;
  reverse?: boolean;
};

const AnimatedLinearGradient = ({
  progress,
  width,
  height,
  rangeFactor,
  reverse = false
}: AnimatedLinearGradientProps) => {
  const animationRange = useMemo(
    () => width * rangeFactor,
    [width, rangeFactor]
  );

  const animatedStart = useDerivedValue(() => {
    const startX = interpolate(
      progress.value,
      reverse ? [1, 0] : [0, 1],
      [-animationRange, animationRange],
      Extrapolation.CLAMP
    );
    return vec(startX, height);
  }, [height]);

  const animatedEnd = useDerivedValue(() => {
    const endX = interpolate(
      progress.value,
      reverse ? [1, 0] : [0, 1],
      [width - animationRange, width + animationRange],
      Extrapolation.CLAMP
    );
    return vec(endX, 0);
  }, [width]);

  return (
    <LinearGradient
      start={animatedStart}
      end={animatedEnd}
      mode="repeat"
      colors={itwGradientColors}
    />
  );
};

const StaticContent = (props: Props) => {
  const {
    title,
    description,
    action,
    onPress,
    size = "large",
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole
  } = props;

  // Generates a complete fallbackAccessibilityLabel by concatenating the title, content, and action
  // if they are present. Removes markdown formatting characters like asterisks.
  const fallbackAccessibilityLabel = [title, description, action]
    .filter(Boolean)
    .join("\n")
    .replace(/\*/g, "");

  const markdownRules = useMemo(
    () => ({
      Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
        return (
          <LabelMini
            key={getTxtNodeKey(paragraph)}
            color="white"
            weight="Regular"
          >
            {paragraph.children.map(render)}
          </LabelMini>
        );
      },
      Strong(strong: TxtStrongNode, render: Renderer) {
        return (
          <LabelMini
            key={getTxtNodeKey(strong)}
            color="white"
            weight="Semibold"
          >
            {strong.children.map(render)}
          </LabelMini>
        );
      }
    }),
    []
  );

  return (
    <View
      style={{ gap: 16 }}
      accessible={true}
      // A11y related props
      accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={action !== undefined ? accessibilityRole : "text"}
    >
      <HStack space={32}>
        <VStack space={8} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignSelf: "center" }}>
              <Badge variant="highlight" text={I18n.t("global.badges.new")} />
            </View>
          </View>
          <H4 color="white">{title}</H4>
        </VStack>
        {size === "large" && (
          <HighlightImage
            width={100}
            height={100}
            style={{ marginRight: -16 }}
          />
        )}
      </HStack>
      <IOMarkdown rules={markdownRules} content={description} />
      {size === "large" && (
        <ButtonSolid
          color="contrast"
          label={action}
          onPress={onPress}
          fullWidth
        />
      )}
      {size === "small" && (
        // Disable pointer events to avoid pressed state on the button
        <Pressable
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessible={true}
          accessibilityElementsHidden
          accessibilityLabel={action}
          accessibilityRole="button"
          onPress={onPress}
        >
          <ButtonLink color="contrast" label={action} onPress={onPress} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["blueIO-500"],
    display: "flex",
    padding: 16,
    borderRadius: 16,
    overflow: "visible",
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
