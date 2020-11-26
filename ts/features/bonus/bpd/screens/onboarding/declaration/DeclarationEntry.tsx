import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Body } from "../../../../../../components/core/typography/Body";
import { XOR } from "../../../../../../types/utils";
import { RawCheckBox } from "../../../../../../components/core/selection/RawCheckBox";

const styles = StyleSheet.create({
  main: { flex: 1, flexDirection: "row", flexWrap: "nowrap" },
  shrink: { flexShrink: 1 }
});

type Props = {
  // in order to accepts composite text with bold
  text: XOR<string, React.ReactNode>;
  onValueChange: (value: boolean) => void;
};

/**
 * Choose between a string or a node
 * @param text
 */
const pickText = (text: XOR<string, React.ReactNode>) =>
  typeof text === "string" ? <Body>{text}</Body> : text;

/**
 * A declaration entry (checkbox + text) that the user have to accept in order to continue
 * @constructor
 */
export const DeclarationEntry: React.FunctionComponent<Props> = props => {
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const handleOnPress = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    props.onValueChange(newValue);
  };

  return (
    <View>
      <View style={styles.main}>
        <RawCheckBox checked={isChecked} onPress={handleOnPress} />
        <View hspacer={true} />
        <View style={styles.shrink}>
          <TouchableWithoutFeedback onPress={handleOnPress}>
            {pickText(props.text)}
          </TouchableWithoutFeedback>
        </View>
      </View>
      <View spacer={true} large={true} />
    </View>
  );
};
