import {
  HStack,
  IOColors,
  IOText,
  Icon,
  hexToRgba
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import { Pressable, StyleSheet } from "react-native";
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
      <HStack space={4} style={{ alignItems: "center" }}>
        <Icon name="ladybug" size={16} color="warning-850" />
        <IOText
          size={14}
          font={"TitilliumSansPro"}
          weight={"Semibold"}
          color="warning-850"
          style={{
            letterSpacing: 0.2,
            textTransform: "uppercase"
          }}
        >
          {dataSize}
        </IOText>
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
  }
});
