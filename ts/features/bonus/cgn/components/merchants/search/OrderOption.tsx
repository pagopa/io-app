import { Icon } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable } from "react-native";
import { H4 } from "../../../../../../components/core/typography/H4";

type Props = {
  text: string;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const OrderOption = ({ text, value, onPress, checked }: Props) => (
  <Pressable
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
    <Icon
      name={checked ? "legRadioOn" : "legRadioOff"}
      size={24}
      color={checked ? "blue" : "bluegrey"}
    />
  </Pressable>
);

export default OrderOption;
