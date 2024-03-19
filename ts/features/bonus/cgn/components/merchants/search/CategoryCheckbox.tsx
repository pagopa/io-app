import { HSpacer, IOCategoryIcons, Icon } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable, View } from "react-native";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";
import { H4 } from "../../../../../../components/core/typography/H4";

type Props = {
  text: string;
  icon: IOCategoryIcons;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const CategoryCheckbox = ({ text, icon, value, onPress, checked }: Props) => (
  <Pressable
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={() => onPress(value)}
  >
    <View style={{ flexDirection: "row" }}>
      <Icon name={icon} size={20} color="bluegrey" />
      <HSpacer size={16} />
      <H4 weight={"Regular"}>{text.toUpperCase()}</H4>
    </View>
    <RawCheckBox checked={checked} onPress={() => onPress(value)} />
  </Pressable>
);

export default CategoryCheckbox;
