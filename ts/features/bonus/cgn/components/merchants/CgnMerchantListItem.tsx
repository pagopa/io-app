import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { index } from "fp-ts/lib/Array";
import { H5 } from "../../../../../components/core/typography/H5";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { getCategorySpecs } from "../../utils/filters";
import I18n from "../../../../../i18n";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

type Props = {
  categories: ReadonlyArray<ProductCategory>;
  name: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  categories: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    paddingVertical: 16
  }
});
const renderCategoryElement = (category: ProductCategory) =>
  getCategorySpecs(category).fold(undefined, c => (
    <View style={[styles.row]}>
      {c.icon({ height: 22, width: 22, fill: IOColors.bluegrey })}
      <View hspacer small />
      <H5 weight={"SemiBold"} color={"bluegrey"}>
        {I18n.t(c.nameKey).toLocaleUpperCase()}
      </H5>
    </View>
  ));

// This is used to render the product categories of a merchant
// if there's more than 2 categories available we render a placeholder text to enumerate how many categories
// are missing from the list
const CategoriesRow = ({ categories }: Pick<Props, "categories">) => (
  <View style={[styles.categories, IOStyles.flex]}>
    {categories.length > 2
      ? index(0, [...categories]).fold(undefined, c => (
          <>
            {renderCategoryElement(c)}
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
              {I18n.t("bonus.cgn.merchantDetail.categories.counting", {
                count: categories.length - 1
              }).toLocaleUpperCase()}
            </H5>
          </>
        ))
      : categories.map(category => (
          <>
            {renderCategoryElement(category)}
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
  </View>
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
    <CategoriesRow categories={props.categories} />
  </TouchableDefaultOpacity>
);

export default CgnMerchantListItem;
