import React from "react";
import { LayoutChangeEvent, View } from "react-native";
import {
  ContentWrapper,
  H2,
  IOStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import Animated, { AnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";

type Props = {
  children: React.ReactNode;
  animatedRef: AnimatedRef<Animated.ScrollView>;
  title: string;
  titleAccessibilityLabel?: string;
};

/**
 * This component is a simplified version of `IOScrollViewWithLargeHeader`
 * without the navigation header. This way the header can be configured from outside
 * for maximum customization.
 */
export const ItwScrollViewWithLargeHeader = ({
  children,
  animatedRef,
  title,
  titleAccessibilityLabel
}: Props) => {
  const [titleHeight, setTitleHeight] = React.useState(0);
  const theme = useIOTheme();

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  return (
    <IOScrollView
      includeContentMargins={false}
      animatedRef={animatedRef}
      snapOffset={titleHeight}
    >
      <View
        accessible
        style={IOStyles.horizontalContentPadding}
        onLayout={getTitleHeight}
      >
        <H2
          color={theme["textHeading-default"]}
          accessibilityLabel={titleAccessibilityLabel ?? title}
          accessibilityRole="header"
        >
          {title}
        </H2>
      </View>
      <VSpacer size={16} />
      <ContentWrapper>{children}</ContentWrapper>
    </IOScrollView>
  );
};
