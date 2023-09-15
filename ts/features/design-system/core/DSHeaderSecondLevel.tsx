import * as React from "react";
import { useState } from "react";
import { Alert, View, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import { NewH3 } from "../../../components/core/typography/NewH3";
import HeaderSecondLevel from "../../../components/ui/HeaderSecondLevel";
import { VSpacer } from "../../../components/core/spacer/Spacer";

// This is defined as about the half of a default ListItem… component
const defaultTriggerOffsetValue: number = 32;

export const DSHeaderSecondLevel = () => {
  const [triggerOffsetValue, setTriggerOffsetValue] = useState(
    defaultTriggerOffsetValue
  );
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTriggerOffsetValue(height);
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
            triggerOffset: triggerOffsetValue
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
  }, [navigation, translationY, triggerOffsetValue]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, triggerOffsetValue]}
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
