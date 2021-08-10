import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { H5 } from "../../../../../components/core/typography/H5";
import { H2 } from "../../../../../components/core/typography/H2";
import { Label } from "../../../../../components/core/typography/Label";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { getCategorySpecs } from "../../utils/filters";
import I18n from "../../../../../i18n";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";

type Props = {
  category: ProductCategory | undefined;
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
  <TouchableDefaultOpacity
    style={styles.verticalPadding}
    onPress={props.onPress}
  >
    {props.category &&
      getCategorySpecs(props.category).fold(undefined, c => (
        <View style={styles.row}>
          <IconFont name={c.icon} size={22} color={IOColors.bluegrey} />
          <View hspacer small />
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t(c.nameKey).toLocaleUpperCase()}
          </H5>
        </View>
      ))}
    <View spacer small />
    <H2>{props.name}</H2>
    <Label weight={"Regular"} color={"bluegrey"}>
      {props.location}
    </Label>
  </TouchableDefaultOpacity>
);

export default CgnMerchantListItem;
