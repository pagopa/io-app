import React from "react";
import { LayoutChangeEvent, View } from "react-native";
import {
  Body,
  ContentWrapper,
  H2,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import Animated, { AnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";

type Props = {
  children: React.ReactNode;
  animatedRef: AnimatedRef<Animated.ScrollView>;
  title: string;
  titleAccessibilityLabel?: string;
  description?: string;
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
  titleAccessibilityLabel,
  description
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
      <ContentWrapper>
        <VStack space={16}>
          <View accessible onLayout={getTitleHeight}>
            <H2
              color={theme["textHeading-default"]}
              accessibilityLabel={titleAccessibilityLabel ?? title}
              accessibilityRole="header"
            >
              {title}
            </H2>
          </View>
          {description && (
            <Body color={theme["textBody-tertiary"]}>{description}</Body>
          )}
          <View>{children}</View>
        </VStack>
      </ContentWrapper>
    </IOScrollView>
  );
};
