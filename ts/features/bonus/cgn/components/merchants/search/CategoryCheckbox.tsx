import { ListItem, View } from "native-base";
import * as React from "react";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { H4 } from "../../../../../../components/core/typography/H4";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";

type Props = {
  text: string;
  icon: string;
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
      <IconFont name={icon} size={22} color={IOColors.bluegrey} />
      <View hspacer />
      <H4 weight={"Regular"}>{text.toUpperCase()}</H4>
    </View>
    <RawCheckBox checked={checked} onPress={() => onPress(value)} />
  </ListItem>
);

export default CategoryCheckbox;
