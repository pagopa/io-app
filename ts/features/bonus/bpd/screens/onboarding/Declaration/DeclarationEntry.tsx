import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CheckBox } from "../../../../../../components/core/selection/CheckBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { XOR } from "../../../../../../types/utils";

const styles = StyleSheet.create({
  main: { flex: 1, flexDirection: "row", flexWrap: "nowrap" }
});

type Props = {
  // in order to accepts composite text with bold
  text: XOR<string, React.ReactNode>;
};

type OwnProps = Props & React.ComponentProps<typeof CheckBox>;

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
export const DeclarationEntry: React.FunctionComponent<OwnProps> = props => (
  <View>
    <View style={styles.main}>
      <CheckBox onValueChange={props.onValueChange} />
      <View hspacer={true} />
      <View style={{ flexShrink: 1 }}>{pickText(props.text)}</View>
    </View>
    <View spacer={true} large={true} />
  </View>
);
