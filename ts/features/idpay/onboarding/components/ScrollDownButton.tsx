import * as React from "react";
import { StyleSheet } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import IconButtonSolid from "../../../../components/ui/IconButtonSolid";

type Props = {
  isVisible?: boolean;
  onPress: () => void;
};

const ScrollDownButton = (props: Props) => {
  const { isVisible, onPress } = props;

  if (isVisible === false) {
    return null;
  }

  return (
    <Animated.View
      key={"scrollDown"}
      style={styles.scrollDownButton}
      entering={ZoomIn.duration(200)}
      exiting={ZoomOut.duration(200)}
    >
      <IconButtonSolid
        accessibilityLabel="Scroll to bottom"
        icon="arrowBottom"
        onPress={onPress}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrollDownButton: {
    position: "absolute",
    right: 20,
    bottom: 50
  }
});

export { ScrollDownButton };
