import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../../i18n";
import { getCategorySpecs } from "../../utils/filters";

type Props = {
  categories: ReadonlyArray<ProductCategory>;
  isNew: boolean;
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
  },
  badgePosition: { alignSelf: "center", marginLeft: 8 }
});

export const renderCategoryElement = (category: ProductCategory) =>
  pipe(
    getCategorySpecs(category),
    O.fold(
      () => undefined,
      c => (
        <View style={styles.row}>
          {c.icon({ height: 22, width: 22, fill: IOColors.bluegrey })}
          <HSpacer size={8} />
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t(c.nameKey).toLocaleUpperCase()}
          </H5>
        </View>
      )
    )
  );

// This is used to render the product categories of a merchant
// if there's more than 2 categories available we render a placeholder text to enumerate how many categories
// are missing from the list
const CategoriesRow = ({ categories }: Pick<Props, "categories">) => (
  <View style={[styles.categories, IOStyles.flex]}>
    {categories.length > 2
      ? pipe(
          AR.lookup(0, [...categories]),
          O.fold(
            () => undefined,
            c => (
              <>
                {renderCategoryElement(c)}
                <HSpacer size={8} />
                {/* Using a View for the border
                to replace an improper styled spacer */}
                <View
                  style={{
                    borderRightColor: IOColors.bluegrey,
                    borderRightWidth: 1
                  }}
                />
                <HSpacer size={8} />
                <H5 color={"bluegrey"} weight={"SemiBold"}>
                  {I18n.t("bonus.cgn.merchantDetail.categories.counting", {
                    count: categories.length - 1
                  }).toLocaleUpperCase()}
                </H5>
              </>
            )
          )
        )
      : categories.map((category, i) => (
          <View key={i} style={[IOStyles.row, { paddingBottom: 2 }]}>
            {renderCategoryElement(category)}
            {categories.indexOf(category) !== categories.length - 1 && (
              <>
                <HSpacer size={8} />
                <View
                  style={{
                    borderRightColor: IOColors.bluegrey,
                    borderRightWidth: 1
                  }}
                />
                <HSpacer size={8} />
              </>
            )}
          </View>
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
    accessibilityRole={"button"}
    onPress={props.onPress}
  >
    <View style={[styles.categories, { justifyContent: "space-between" }]}>
      <H2 style={IOStyles.flex}>{props.name}</H2>
      {props.isNew && (
        <View style={styles.badgePosition}>
          <IOBadge
            small
            variant="solid"
            color="blue"
            text={I18n.t("bonus.cgn.merchantsList.news")}
          />
        </View>
      )}
    </View>
    <VSpacer size={8} />
    <CategoriesRow categories={props.categories} />
  </TouchableDefaultOpacity>
);

export default CgnMerchantListItem;
