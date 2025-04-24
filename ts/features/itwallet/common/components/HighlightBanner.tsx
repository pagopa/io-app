import {
  Badge,
  ButtonLink,
  ButtonSolid,
  H4,
  HStack,
  IOColors,
  IOStyles,
  LabelMini,
  VStack,
  WithTestID,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { TxtParagraphNode, TxtStrongNode } from "@textlint/ast-node-types";
import { useMemo, useState } from "react";
import { AccessibilityRole, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle
} from "react-native-reanimated";
import HighlightImage from "../../../../../img/features/itWallet/l3/highlight.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";

type HighlightBannerProps = {
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

export const HighlightBanner = (props: WithTestID<HighlightBannerProps>) => {
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
      elevation: scale * 5
    };
  });

  if (size === "small") {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessible={false}
      >
        <Animated.View
          style={[styles.container, scaleAnimatedStyle, shadowAnimatedStyle]}
        >
          <BannerGradient />
          <BannerContent {...props} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={styles.container}
      // A11y related props
      accessible={false}
    >
      <BannerGradient />
      <BannerContent {...props} />
    </View>
  );
};

const BannerGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <Canvas
      style={styles.gradient}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect x={0} y={0} width={width} height={height} r={16}>
        <LinearGradient
          start={vec(0, height / 1.5)}
          end={vec(width, 0)}
          colors={[
            "#0B3EE3",
            "#436FFF",
            "#1E53FF",
            "#0B3EE3",
            "#2A5CFF",
            "#0B3EE3"
          ]}
        />
      </RoundedRect>
    </Canvas>
  );
};

const BannerContent = (props: HighlightBannerProps) => {
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

  /* Generates a complete fallbackAccessibilityLabel by concatenating the title, content, and action
   if they are present. */
  const fallbackAccessibilityLabel = [title, description, action]
    .filter(Boolean)
    .join(" ");

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
          <View style={IOStyles.row}>
            <View style={IOStyles.selfCenter}>
              <Badge variant="highlight" text="Novità" />
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
