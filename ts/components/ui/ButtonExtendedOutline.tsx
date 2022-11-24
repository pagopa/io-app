import * as React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent
} from "react-native";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { H4 } from "../core/typography/H4";
import { LabelSmall } from "../core/typography/LabelSmall";
import IconFont from "./IconFont";

type Props = {
  label: string;
  description?: string;
  onPress: (event: GestureResponderEvent) => void;
  iconName?: string;
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    backgroundColor: IOColors.white,
    borderStyle: "solid",
    borderWidth: 1
  }
});

const ButtonExtendedOutline: React.FunctionComponent<Props> = ({
  label,
  description,
  onPress,
  iconName = "io-info"
}: Props) => (
  <View>
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          transform: [
            {
              scale: pressed ? 0.97 : 1
            }
          ]
        },
        styles.button
      ]}
    >
      <View style={IOStyles.flex}>
        <H4>{label}</H4>
        {description && (
          <LabelSmall weight="Regular" color={"bluegreyDark"}>
            {description}
          </LabelSmall>
        )}
      </View>
      <IconFont
        style={{ marginLeft: 8 }}
        name={iconName}
        color={IOColors.blue}
        size={24}
      />
    </Pressable>
  </View>
);

export default ButtonExtendedOutline;
