import { ListItem } from "native-base";
import { View } from "react-native";
import * as React from "react";
import { HSpacer, IOCategoryIcons, Icon } from "@pagopa/io-app-design-system";
import { H4 } from "../../../../../../components/core/typography/H4";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";

type Props = {
  text: string;
  icon: IOCategoryIcons;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const CategoryCheckbox = ({ text, icon, value, onPress, checked }: Props) => (
  <ListItem
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
  </ListItem>
);

export default CategoryCheckbox;
