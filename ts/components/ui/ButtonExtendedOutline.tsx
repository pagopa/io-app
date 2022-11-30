import * as React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent
} from "react-native";
import { Icon, IOIconType } from "../core/icons";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { H4 } from "../core/typography/H4";
import { LabelSmall } from "../core/typography/LabelSmall";

type Props = {
  label: string;
  description?: string;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIconType;
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

export const ButtonExtendedOutline: React.FunctionComponent<Props> = ({
  label,
  description,
  onPress,
  icon = "info"
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
      <View>
        <H4>{label}</H4>
        {description && (
          <LabelSmall weight="Regular" color={"bluegreyDark"}>
            {description}
          </LabelSmall>
        )}
      </View>
      <View style={{ marginLeft: 8 }}>
        <Icon name={icon} color="blue" size={24} />
      </View>
    </Pressable>
  </View>
);
