import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import themeVariables from "../theme/variables";
import { Icon, IOIcons } from "./core/icons";
import type { IOColors } from "./core/variables/IOColors";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  text: string;
  iconName?: IOIcons;
  iconSize?: number;
  iconColor?: IOColors;
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
    <View style={styles.icon}>
      <Icon
        name={props.iconName || "legNotice"}
        size={props.iconSize ?? defaultIconSize}
        color={props.iconColor || "blue"}
      />
    </View>

    <NBText style={styles.text}>{props.text}</NBText>
  </View>
);

export default React.memo(AdviceComponent);
