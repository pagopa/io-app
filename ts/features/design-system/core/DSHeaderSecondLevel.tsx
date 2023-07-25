import * as React from "react";
import { useState } from "react";
import { Alert, View, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Body } from "../../../components/core/typography/Body";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import IconButton from "../../../components/ui/IconButton";
import { NewH3 } from "../../../components/core/typography/NewH3";
import HeaderSecondLevel from "../../../components/ui/HeaderSecondLevel";
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSHeaderSecondLevel = () => {
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          scrollValues={{
            contentOffsetY: translationY,
            triggerOffset: titleHeight
          }}
          title={"Questo è un titolo lungo, ma lungo lungo davvero, eh!"}
          firstAction={
            <IconButton
              icon="help"
              color="neutral"
              onPress={() => {
                Alert.alert("Contextual Help");
              }}
              accessibilityLabel={""}
            />
          }
        />
      )
    });
  }, [navigation, titleHeight, translationY]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View onLayout={getTitleHeight}>
        <NewH3>Questo è un titolo lungo, ma lungo lungo davvero, eh!</NewH3>
      </View>
      <VSpacer />
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
    </Animated.ScrollView>
  );
};
