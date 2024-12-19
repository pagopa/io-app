import {
  ContentWrapper,
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import {
  PaymentCard,
  PaymentCardComponentProps
} from "../../common/components/PaymentCard";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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
}: React.PropsWithChildren<Props>) => {
  const isDSenabled = useIOSelector(isDesignSystemEnabledSelector);
  const insets = useSafeAreaInsets();
  const translationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];
  const blueHeaderColor = isDSenabled ? IOColors["blueIO-600"] : IOColors.blue;
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: headerTitle,
    backgroundColor: blueHeaderColor,
    variant: "contrast",
    faqCategories: ["wallet_methods"],
    supportRequest: true,
    transparent: true,
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
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

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 48,
        backgroundColor
      }}
      ref={animatedScrollViewRef}
    >
      <FocusAwareStatusBar
        backgroundColor={blueHeaderColor}
        barStyle="light-content"
      />
      <View style={[styles.blueHeader, { backgroundColor: blueHeaderColor }]}>
        <View style={styles.cardContainer} onLayout={getTitleHeight}>
          <PaymentCard {...card} />
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
    paddingTop: "105%",
    marginTop: "-75%",
    marginBottom: "15%"
  }
});

export { PaymentsMethodDetailsBaseScreenComponent };
