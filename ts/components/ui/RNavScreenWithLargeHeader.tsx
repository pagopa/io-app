import {
  H3,
  HeaderSecondLevel,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

type Props = {
  children: React.ReactNode;
  title: string;
} & SupportRequestParams;

export const RNavScreenWithLargeHeader = ({
  children,
  title,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const startSupportRequest = useStartSupportRequest({
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories
  });
  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          goBack={navigation.goBack}
          scrollValues={{
            contentOffsetY: translationY,
            triggerOffset: titleHeight
          }}
          title={title}
          type="singleAction"
          firstAction={{
            icon: "help",
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            ),
            onPress: startSupportRequest
          }}
          backAccessibilityLabel={I18n.t("global.buttons.back")}
        />
      )
    });
  }, [navigation, startSupportRequest, title, titleHeight, translationY]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View onLayout={getTitleHeight}>
        <H3>{title}</H3>
      </View>
      {children}
    </Animated.ScrollView>
  );
};
