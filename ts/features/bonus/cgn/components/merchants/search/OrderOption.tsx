import * as React from "react";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { H4 } from "../../../../../../components/core/typography/H4";
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";

type Props = {
  text: string;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const OrderOption = ({ text, value, onPress, checked }: Props) => (
  <TouchableDefaultOpacity
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={() => onPress(value)}
  >
    <H4 weight={checked ? "SemiBold" : "Regular"} color={"bluegreyDark"}>
      {text}
    </H4>
    <IconFont
      name={checked ? "io-radio-on" : "io-radio-off"}
      size={22}
      color={checked ? IOColors.blue : IOColors.bluegrey}
    />
  </TouchableDefaultOpacity>
);

export default OrderOption;
