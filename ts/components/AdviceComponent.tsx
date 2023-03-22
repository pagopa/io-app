import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import themeVariables from "../theme/variables";
import { IOStyles } from "./core/variables/IOStyles";
import IconFont from "./ui/IconFont";

type Props = {
  text: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
};
const styles = StyleSheet.create({
  icon: {
    marginTop: 4
  },
  text: {
    marginLeft: 8,
    fontSize: themeVariables.fontSizeBase
  }
});

const defaultIconSize = 18;
/**
 * This component displays an info icon on top-left and a text message
 * @constructor
 */
const AdviceComponent: React.FunctionComponent<Props> = (props: Props) => (
  <View style={IOStyles.row}>
    <IconFont
      style={styles.icon}
      name={props.iconName || "io-notice"}
      size={props.iconSize ?? defaultIconSize}
      color={props.iconColor || themeVariables.brandPrimary}
    />
    <NBText style={styles.text}>{props.text}</NBText>
  </View>
);

export default React.memo(AdviceComponent);
