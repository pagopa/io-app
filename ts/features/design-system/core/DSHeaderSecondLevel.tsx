import * as React from "react";
import { Alert, View } from "react-native";
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
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";

export const DSHeaderSecondLevel = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const translationY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          scrollValue={translationY}
          title={"Preferenze"}
          firstAction={
            <IconButton
              icon="archive"
              color="neutral"
              onPress={() => {
                Alert.alert("Archive");
              }}
              accessibilityLabel={""}
            />
          }
          secondAction={
            <IconButton
              icon="starEmpty"
              color="neutral"
              onPress={() => {
                Alert.alert("Star");
              }}
              accessibilityLabel={""}
            />
          }
          thirdAction={
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
  }, [navigation, translationY]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToInterval={50}
      decelerationRate="fast"
      disableIntervalMomentum={false}
    >
      <View
        style={{
          backgroundColor: hexToRgba(IOColors["blueIO-100"], 0.5)
        }}
      >
        <NewH3>Preferenze</NewH3>
      </View>
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
    </Animated.ScrollView>
  );
};
