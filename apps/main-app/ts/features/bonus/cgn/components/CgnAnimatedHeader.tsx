import {
  Avatar,
  ContentWrapper,
  H3,
  HStack,
  IOColors,
  IOVisualCostants,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import { CgnAnimatedBackground } from "./CgnAnimatedBackground";

type CgnAnimatedHeaderProps = {
  children?: React.ReactNode;
  /** 0 = idle, 1 = refreshing */
  isRefreshingValue?: SharedValue<number>;
  /** 0–1 value tracking how far the user has pulled (from scroll offset) */
  pullProgress?: SharedValue<number>;
  ref?: React.Ref<View>;
};

const HEIGHT = Platform.select({ ios: 210, android: 185, default: 185 });
const CARD_BORDER_RADIUS = 24;

const CgnAnimatedHeader = ({
  children,
  ref,
  pullProgress,
  isRefreshingValue
}: CgnAnimatedHeaderProps) => {
  const { themeType } = useIOThemeContext();
  const isDark = themeType === "dark";
  const indicatorColor = isDark
    ? IOColors["blueIO-50"]
    : IOColors["blueItalia-850"];

  // Fallback SharedValues so hooks are always called unconditionally
  const defaultPullProgress = useSharedValue(0);
  const defaultIsRefreshing = useSharedValue(0);
  const effectivePull = pullProgress ?? defaultPullProgress;
  const effectiveRefreshing = isRefreshingValue ?? defaultIsRefreshing;

  const indicatorAnimStyle = useAnimatedStyle(() => {
    const progress = Math.max(effectivePull.value, effectiveRefreshing.value);
    return {
      opacity: progress,
      transform: [{ scale: 0.8 + 0.2 * progress }]
    };
  });

  return (
    <View
      pointerEvents="box-none"
      ref={ref}
      style={{ minHeight: HEIGHT, justifyContent: "flex-end", zIndex: 0 }}
    >
      <View
        pointerEvents="box-none"
        style={[
          {
            height: HEIGHT,
            overflow: "hidden",
            justifyContent: "flex-end"
          },
          Platform.OS === "ios" && {
            borderTopLeftRadius: CARD_BORDER_RADIUS,
            borderTopRightRadius: CARD_BORDER_RADIUS
          }
        ]}
      >
        <View
          pointerEvents="none"
          style={{ ...StyleSheet.absoluteFill, zIndex: 0 }}
        >
          <CgnAnimatedBackground />
        </View>
        {Platform.OS === "ios" && (
          <Animated.View
            pointerEvents="none"
            style={[
              indicatorAnimStyle,
              {
                position: "absolute",
                bottom: HEIGHT * 0.6,
                alignSelf: "center",
                zIndex: 2
              }
            ]}
          >
            <ActivityIndicator color={indicatorColor} size="large" />
          </Animated.View>
        )}
        <ContentWrapper
          style={{
            paddingBottom: IOVisualCostants.appMarginDefault
          }}
        >
          <HStack space={16} style={{ alignItems: "center" }}>
            <Avatar logoUri={cgnLogo} size="medium" />
            <View style={{ flex: 1 }}>
              <H3>{I18n.t("bonus.cgn.merchantsList.screenTitle")}</H3>
            </View>
          </HStack>
        </ContentWrapper>
      </View>
      <VSpacer size={16} />
      {children}
    </View>
  );
};

export default CgnAnimatedHeader;
