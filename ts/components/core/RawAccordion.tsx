import { View } from "native-base";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager
} from "react-native";
import themeVariables from "../../theme/variables";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import { IOStyles } from "./variables/IOStyles";

type Props = {
  // The accordion component must accept one children
  header: React.ReactElement;
  children: React.ReactElement;
};

const styles = StyleSheet.create({
  headerIcon: {
    paddingHorizontal: themeVariables.contentPadding,
    alignSelf: "center"
  },
  row: {
    ...IOStyles.row,
    justifyContent: "space-between"
  }
});

export const RawAccordion: React.FunctionComponent<Props> = props => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const animatedController = useRef(new Animated.Value(1)).current;

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ["-90deg", "90deg"]
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          Animated.timing(animatedController, {
            duration: 300,
            toValue: isOpen ? 1 : 0,
            useNativeDriver: true,
            easing: Easing.linear
          }).start();
          setOpen(!isOpen);
        }}
      >
        <View style={styles.row}>
          {props.header}
          <Animated.View
            style={{
              ...styles.headerIcon,
              transform: [{ rotateZ: arrowAngle }]
            }}
          >
            <IconFont
              name={"io-right"}
              color={customVariables.brandPrimary}
              size={24}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
      {isOpen && props.children}
    </View>
  );
};
