import {
  Avatar,
  ContentWrapper,
  H3,
  hexToRgba,
  HSpacer,
  IOColors,
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
  ref?: React.Ref<View>;
  /** 0–1 value tracking how far the user has pulled (from scroll offset) */
  pullProgress?: SharedValue<number>;
  /** 0 = idle, 1 = refreshing */
  isRefreshingValue?: SharedValue<number>;
};

const HEIGHT = Platform.select({ ios: 210, android: 185 });

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
      transform: [{ scale: 0.6 + 0.4 * progress }]
    };
  });

  return (
    <View
      style={{ minHeight: HEIGHT, justifyContent: "flex-end", zIndex: 0 }}
      pointerEvents="box-none"
      ref={ref}
    >
      {Platform.OS === "ios" && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            height: 100,
            top: -100,
            right: 0,
            left: 0
          }}
        />
      )}
      {Platform.OS === "ios" && (
        <Animated.View
          pointerEvents="none"
          style={[
            indicatorAnimStyle,
            {
              position: "absolute",
              top: -44,
              alignSelf: "center",
              zIndex: 2
            }
          ]}
        >
          <ActivityIndicator color={indicatorColor} size="large" />
        </Animated.View>
      )}
      <View
        style={{
          position: "relative",
          height: HEIGHT,
          justifyContent: "flex-end"
        }}
        pointerEvents="box-none"
      >
        <View
          style={{ ...StyleSheet.absoluteFill, zIndex: 0 }}
          pointerEvents="none"
        >
          <CgnAnimatedBackground />
        </View>
        <ContentWrapper
          style={{
            paddingBottom: 24,
            zIndex: 1,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: HEIGHT,
            justifyContent: "flex-end"
          }}
          pointerEvents="box-none"
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: hexToRgba(IOColors.white, 0.2),
                height: 66,
                width: 66,
                borderRadius: 8
              }}
            >
              <Avatar size="medium" logoUri={cgnLogo} />
            </View>
            <HSpacer size={16} />
            <View style={{ flex: 1 }}>
              <H3>{I18n.t("bonus.cgn.merchantsList.screenTitle")}</H3>
            </View>
          </View>
        </ContentWrapper>
      </View>
      <VSpacer size={16} />
      {children}
    </View>
  );
};

export default CgnAnimatedHeader;
