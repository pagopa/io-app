import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import themeVariables from "../theme/variables";
import IconFont from "./ui/IconFont";

type Props = {
  text: string;
  iconName?: string;
  iconColor?: string;
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  icon: {
    marginTop: 4
  },
  text: {
    marginLeft: 8,
    paddingRight: 18,
    fontSize: themeVariables.fontSizeBase
  }
});

const iconSize = 18;
/**
 * This component displays an info icon on top-left and a text message
 * @constructor
 */
const AdviceComponent: React.FunctionComponent<Props> = (props: Props) => (
    <View style={styles.container}>
      <IconFont
        style={styles.icon}
        name={props.iconName || "io-notice"}
        size={iconSize}
        color={props.iconColor || themeVariables.brandPrimary}
      />
      <Text style={styles.text}>{props.text}</Text>
    </View>
  );

export default React.memo(AdviceComponent);
