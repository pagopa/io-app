import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { H5 } from "../../../../../components/core/typography/H5";
import { H2 } from "../../../../../components/core/typography/H2";
import { Label } from "../../../../../components/core/typography/Label";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = {
  // FIXME change the props when merchant definition is available
  category: string;
  name: string;
  location: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    paddingVertical: 16
  }
});

/**
 * Component for list item rendering of a conventioned merchant for cgn discounts
 * @param props
 * @constructor
 */
const CgnMerchantListItem: React.FunctionComponent<Props> = (props: Props) => (
  <View style={styles.verticalPadding}>
    <View style={styles.row}>
      {/* TODO when available and defined the icon name should be defined through a map of category codes */}
      <IconFont name={"io-books"} size={22} color={IOColors.bluegrey} />
      <View hspacer small />
      <H5 weight={"SemiBold"} color={"bluegrey"}>
        {props.category.toLocaleUpperCase()}
      </H5>
    </View>
    <View spacer small />
    <H2>{props.name}</H2>
    <Label weight={"Regular"} color={"bluegrey"}>
      {props.location}
    </Label>
  </View>
);

export default CgnMerchantListItem;
