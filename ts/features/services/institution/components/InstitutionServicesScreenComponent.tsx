import React, { useLayoutEffect, useMemo } from "react";
import { RefreshControl, RefreshControlProps, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

type InstitutionServicesScreenComponentProps = {
  children: React.ReactNode;
  goBack?: () => void;
  title?: string;
} & Pick<RefreshControlProps, "onRefresh" | "refreshing">;

const scrollTriggerOffsetValue: number = 88;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  refreshControlContainer: {
    zIndex: 1
  }
});

export const InstitutionServicesScreenComponent = ({
  children,
  refreshing,
  goBack,
  onRefresh,
  title = ""
}: InstitutionServicesScreenComponentProps) => {
  const navigation = useIONavigation();
  const headerHeight = useHeaderHeight();

  const safeAreaInsets = useSafeAreaInsets();

  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = event.contentOffset.y;
  });

  useHeaderSecondLevel({
    goBack,
    title,
    supportRequest: true,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  const refreshControl = (
    <RefreshControl
      onRefresh={onRefresh}
      progressViewOffset={headerHeight}
      refreshing={refreshing}
      style={styles.refreshControlContainer}
    />
  );

  return (
    <Animated.ScrollView
      contentContainerStyle={[
        styles.scrollContentContainer,
        {
          paddingBottom: bottomMargin
        }
      ]}
      onScroll={scrollHandler}
      refreshControl={refreshControl}
      scrollEventThrottle={16}
    >
      {children}
    </Animated.ScrollView>
  );
};
