import {
  Body,
  ContentWrapper,
  H2,
  HeaderSecondLevel,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React, { ComponentProps, useLayoutEffect, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderActionProps, useHeaderProps } from "../../hooks/useHeaderProps";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  headerActionsProp?: HeaderActionProps;
} & SupportRequestParams;

/**
 * A screen with a large header that can be used as a template for other screens.
 * It also handles the contextual help and the faq. The usage of LargeHeader naming is due to a similar behaviour
 * offered by react-navigation/native-stack, referencing the native API from iOS platform.
 * @param children
 * @param title
 * @param contextualHelp
 * @param contextualHelpMarkdown
 * @param faqCategories
 * @param headerProps
 */
export const RNavScreenWithLargeHeader = ({
  children,
  title,
  description,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  headerActionsProp = {}
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = useHeaderProps({
    backAccessibilityLabel: I18n.t("global.buttons.back"),
    goBack: navigation.goBack,
    title,
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories,
    ...headerActionsProp
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderSecondLevel {...headerProps} />
    });
  }, [headerProps, navigation]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        flexGrow: 1
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View style={IOStyles.horizontalContentPadding} onLayout={getTitleHeight}>
        <H2>{title}</H2>
      </View>

      {description && (
        <ContentWrapper>
          <VSpacer size={4} />
          <Body color="grey-700">{description}</Body>
          <VSpacer size={16} />
        </ContentWrapper>
      )}

      {children}
    </Animated.ScrollView>
  );
};
