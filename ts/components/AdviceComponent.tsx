import { Text, View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import themeVariables from "../theme/variables";
import IconFont from "./ui/IconFont";
import { Link } from "./core/typography/Link";

type Props = {
  text: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  textStyle?: StyleProp<TextStyle>;
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  icon: {},
  text: {
    marginLeft: 16,
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
      size={props.iconSize ?? iconSize}
      color={props.iconColor || themeVariables.brandPrimary}
    />
    <Text style={[styles.text, props.textStyle]}>
      {props.text}{" "}
      <Text
        style={{
          color: "white",
          textDecorationLine: "underline",
          fontWeight: "bold"
        }}
      >
        {"test"}
      </Text>
    </Text>
  </View>
);

export default React.memo(AdviceComponent);
