import * as React from "react";
import { Alert, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolate,
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
import {
  IOStyles,
  IOVisualCostants
} from "../../../components/core/variables/IOStyles";
import { makeFontStyleObject } from "../../../components/core/fonts";
import IconButton from "../../../components/ui/IconButton";
import { NewH3 } from "../../../components/core/typography/NewH3";
import { HSpacer } from "../../../components/core/spacer/Spacer";

const borderColorDisabled = hexToRgba(IOColors["grey-100"], 0);
const scrollTriggerOffset: number = 50;

export const DSHeaderSecondLevel = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const translationY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const headerWrapperAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      translationY.value,
      [0, scrollTriggerOffset],
      [borderColorDisabled, IOColors["grey-100"]]
    )
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translationY.value, [0, scrollTriggerOffset], [0, 1])
  }));

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Animated.View
          accessibilityRole="header"
          testID={"HeaderSecondLevel"}
          style={[
            {
              height: IOVisualCostants.headerHeight,
              marginTop: insets.top,
              borderBottomWidth: 1,
              paddingHorizontal: IOVisualCostants.appMarginDefault
            },
            headerWrapperAnimatedStyle
          ]}
        >
          <View style={[IOStyles.row, IOStyles.alignCenter, { flexGrow: 1 }]}>
            <IconButton
              icon={Platform.OS === "ios" ? "backiOS" : "backAndroid"}
              color="neutral"
              onPress={() => {
                navigation.goBack();
              }}
              accessibilityLabel={""}
            />
            <Animated.Text
              style={[
                {
                  ...makeFontStyleObject("Regular", false, "ReadexPro"),
                  fontSize: 14,
                  textAlign: "center",
                  flexGrow: 1
                },
                titleAnimatedStyle
              ]}
            >
              Preferenze
            </Animated.Text>
            <View style={[IOStyles.row, { flexShrink: 0 }]}>
              <IconButton
                icon="info"
                color="neutral"
                onPress={() => {
                  Alert.alert("Info");
                }}
                accessibilityLabel={""}
              />

              {/* SecondAction: Start */}
              {/* Ideally, with the "gap" flex property,
              we can get rid of these ugly constructs */}
              <HSpacer size={16} />
              <IconButton
                icon="starEmpty"
                color="neutral"
                onPress={() => {
                  Alert.alert("Star");
                }}
                accessibilityLabel={""}
              />
              {/* SecondAction: End */}

              {/* ThirdAction: Start */}
              {/* Same as above */}
              <HSpacer size={16} />
              <IconButton
                icon="help"
                color="neutral"
                onPress={() => {
                  Alert.alert("Contextual Help");
                }}
                accessibilityLabel={""}
              />
            </View>
          </View>
        </Animated.View>
      )
    });
  }, [headerWrapperAnimatedStyle, insets.top, navigation, titleAnimatedStyle]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      <NewH3>Preferenze</NewH3>
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
    </Animated.ScrollView>
  );
};
