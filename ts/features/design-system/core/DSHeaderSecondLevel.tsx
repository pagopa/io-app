import * as React from "react";
import { ScrollView, View, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Body } from "../../../components/core/typography/Body";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";

const borderColorDisabled = hexToRgba(IOColors["grey-100"], 0);

export const DSHeaderSecondLevel = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const translationY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const aStyle = useAnimatedStyle(() => ({
    // backgroundColor: interpolateColor(
    //   translationY.value,
    //   [0, 50],
    //   ["white", "skyblue"],
    //   "RGB"
    // ),
    borderColor: interpolateColor(
      translationY.value,
      [0, 50],
      [borderColorDisabled, IOColors["grey-100"]]
    )
  }));

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Animated.View
          style={[
            // eslint-disable-next-line react-native/no-color-literals
            {
              paddingTop: 50,
              padding: 15,
              borderWidth: 1
            },
            aStyle
          ]}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Testing</Text>
        </Animated.View>
      )
    });
  }, [aStyle, navigation]);

  return (
    <View style={{}}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {[...Array(50)].map((_el, i) => (
          <Body key={`body-${i}`}>Repeated text</Body>
        ))}
      </Animated.ScrollView>
    </View>
  );
};
