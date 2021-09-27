import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { index } from "fp-ts/lib/Array";
import { H5 } from "../../../../../components/core/typography/H5";
import { H2 } from "../../../../../components/core/typography/H2";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { getCategorySpecs } from "../../utils/filters";
import I18n from "../../../../../i18n";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";

type Props = {
  categories: ReadonlyArray<ProductCategory>;
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

const CategoriesRow = ({ categories }: Pick<Props, "categories">) => (
  <>
    {categories.length > 2
      ? index(0, [...categories]).fold(undefined, c => (
          <>
            {getCategorySpecs(c).fold(undefined, c => (
              <View style={styles.row}>
                <IconFont name={c.icon} size={22} color={IOColors.bluegrey} />
                <View hspacer small />
                <H5 weight={"SemiBold"} color={"bluegrey"}>
                  {I18n.t(c.nameKey).toLocaleUpperCase()}
                </H5>
              </View>
            ))}
            <View
              hspacer
              small
              style={{
                borderRightColor: IOColors.bluegrey,
                borderRightWidth: 1
              }}
            />
            <View hspacer small />
            <H5 color={"bluegrey"} weight={"SemiBold"}>
              {`E ALTRE ${categories.length - 1}`}
            </H5>
          </>
        ))
      : categories.map(category => (
          <>
            {getCategorySpecs(category).fold(undefined, c => (
              <View style={styles.row}>
                <IconFont name={c.icon} size={22} color={IOColors.bluegrey} />
                <View hspacer small />
                <H5 weight={"SemiBold"} color={"bluegrey"}>
                  {I18n.t(c.nameKey).toLocaleUpperCase()}
                </H5>
              </View>
            ))}
            {categories.indexOf(category) !== categories.length - 1 && (
              <>
                <View
                  hspacer
                  small
                  style={{
                    borderRightColor: IOColors.bluegrey,
                    borderRightWidth: 1
                  }}
                />
                <View hspacer small />
              </>
            )}
          </>
        ))}
  </>
);

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
    <H2>{props.name}</H2>
    <View spacer small />
    <View style={styles.row}>
      <CategoriesRow categories={props.categories} />
    </View>
  </TouchableDefaultOpacity>
);

export default CgnMerchantListItem;
