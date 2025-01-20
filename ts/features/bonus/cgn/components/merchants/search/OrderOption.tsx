import { H6, Icon } from "@pagopa/io-app-design-system";
import { Pressable } from "react-native";

type Props = {
  text: string;
  value: string;
  checked: boolean;
  onPress: (value: string) => void;
};

const OrderOption = ({ text, value, onPress, checked }: Props) => (
  <Pressable
    accessibilityRole="radio"
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={() => onPress(value)}
  >
    <H6 color={"bluegreyDark"}>{text}</H6>
    <Icon
      name={checked ? "legRadioOn" : "legRadioOff"}
      size={24}
      color={checked ? "blue" : "bluegrey"}
    />
  </Pressable>
);

export default OrderOption;
