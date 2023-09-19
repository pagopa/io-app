import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  Icon,
  IOIcons,
  IOIconSizeScale,
  IOColors,
  HSpacer
} from "@pagopa/io-app-design-system";
import { IOStyles } from "./core/variables/IOStyles";
import { Body } from "./core/typography/Body";

type Props = {
  text: string;
  iconName?: IOIcons;
  iconSize?: IOIconSizeScale;
  iconColor?: IOColors;
};

const styles = StyleSheet.create({
  icon: {
    marginTop: 4
  }
});

const defaultIconSize: IOIconSizeScale = 20;
/**
 * This component displays an info icon on top-left and a text message
 * @constructor
 */
const AdviceComponent: React.FunctionComponent<Props> = (props: Props) => (
  <View style={IOStyles.row}>
    <View style={styles.icon}>
      <Icon
        name={props.iconName || "notice"}
        size={props.iconSize ?? defaultIconSize}
        color={props.iconColor || "blue"}
      />
    </View>
    <HSpacer size={8} />
    <Body>{props.text}</Body>
  </View>
);

export default React.memo(AdviceComponent);
