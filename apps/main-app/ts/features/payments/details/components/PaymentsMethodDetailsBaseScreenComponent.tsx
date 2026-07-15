import {
  ContentWrapper,
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { PropsWithChildren, useState } from "react";
import {
  AccessibilityInfo,
  ColorValue,
  LayoutChangeEvent,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  PaymentCard,
  PaymentCardComponentProps
} from "../../common/components/PaymentCard";

type Props = {
  card: PaymentCardComponentProps;
  headerTitle?: string;
};

/**
 * Base layout for payment methods screen & legacy delete handling
 */
const PaymentsMethodDetailsBaseScreenComponent = ({
  card,
  headerTitle = "",
  children
}: PropsWithChildren<Props>) => {
  const insets = useSafeAreaInsets();
  const translationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = useState(0);

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];
  const blueHeaderColor: ColorValue = IOColors["blueIO-600"];
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: headerTitle,
    backgroundColor: blueHeaderColor,
    variant: "contrast",
    faqCategories: ["wallet_methods"],
    supportRequest: true,
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    ignoreAccessibilityCheck: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (titleHeight === 0) {
      setTitleHeight(height - insets.top - IOVisualCostants.headerHeight);
    }
  };

  useOnFirstRender(() => {
    AccessibilityInfo.announceForAccessibility(
      I18n.t("features.payments.details.a11y.announce")
    );
  });

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 48,
        backgroundColor
      }}
      importantForAccessibility="no"
      onScroll={scrollHandler}
      ref={animatedScrollViewRef}
      scrollEventThrottle={8}
      snapToEnd={false}
      snapToOffsets={[0, titleHeight]}
    >
      <FocusAwareStatusBar
        backgroundColor={blueHeaderColor}
        barStyle="light-content"
      />
      <View style={[styles.blueHeader, { backgroundColor: blueHeaderColor }]}>
        <View onLayout={getTitleHeight} style={styles.cardContainer}>
          <View accessibilityRole="summary" accessible>
            <PaymentCard {...card} />
          </View>
        </View>
      </View>
      <VSpacer size={24} />
      <ContentWrapper>{children}</ContentWrapper>
      <VSpacer size={40} />
    </Animated.ScrollView>
  );
};

const cardContainerHorizontalSpacing: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: cardContainerHorizontalSpacing,
    alignSelf: "center",
    marginBottom: "-15%",
    aspectRatio: 1.7,
    width: "100%"
  },
  blueHeader: {
    marginTop: -300,
    paddingTop: 300,
    marginBottom: "15%"
  }
});

export { PaymentsMethodDetailsBaseScreenComponent };
