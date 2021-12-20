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
import themeVariables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import IconFont from "../../ui/IconFont";
import { IOStyles } from "../variables/IOStyles";

type Props = {
  // The header component, an arrow indicating the open/closed state will be added on the right
  header: React.ReactElement;
  // The accordion component must accept one children
  children: React.ReactElement;
  // The component should be animated?
  animated?: boolean;
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

/**
 * Obtains the degree starting from the open state
 * @param isOpen
 */
const getDegree = (isOpen: boolean) => (isOpen ? "-90deg" : "-270deg");

/**
 * The base accordion component, implements the opening and closing logic for viewing the children
 * @param props
 * @constructor
 */
export const RawAccordion: React.FunctionComponent<Props> = props => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const animatedController = useRef(new Animated.Value(1)).current;
  const shouldAnimate = props.animated ?? true;

  const arrowAngle = shouldAnimate
    ? animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: ["-90deg", "-270deg"]
      })
    : getDegree(isOpen);

  useEffect(() => {
    if (Platform.OS === "android" && shouldAnimate) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, [shouldAnimate]);

  const onPress = () => {
    if (shouldAnimate) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.timing(animatedController, {
        duration: 300,
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        easing: Easing.linear
      }).start();
    }
    setOpen(!isOpen);
  };

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
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
