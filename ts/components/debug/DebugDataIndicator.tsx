import {
  HStack,
  IOColors,
  Icon,
  hexToRgba,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import * as React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useIOSelector } from "../../store/hooks";
import { debugDataSelector } from "../../store/reducers/debug";

type DebugDataIndicatorProps = {
  onPress: () => void;
};

export const DebugDataIndicator = (props: DebugDataIndicatorProps) => {
  const data = useIOSelector(debugDataSelector);
  const dataSize = _.size(data);

  if (dataSize === 0) {
    return null;
  }

  return (
    <Pressable
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityHint={"Opend the debug data"}
      onPress={props.onPress}
    >
      <HStack space={4} alignItems="center">
        <Icon name="ladybug" size={16} color="warning-850" />
        <Text style={styles.text}>{dataSize}</Text>
      </HStack>
    </Pressable>
  );
};

const debugItemBgColor = hexToRgba(IOColors["warning-500"], 0.4);
const debugItemBorderColor = hexToRgba(IOColors["warning-850"], 0.1);

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: debugItemBgColor
  },
  text: {
    letterSpacing: 0.2,
    fontSize: 14,
    textTransform: "uppercase",
    color: IOColors["warning-850"],
    ...makeFontStyleObject("Semibold")
  }
});
