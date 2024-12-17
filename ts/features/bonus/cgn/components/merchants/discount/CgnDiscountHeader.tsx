import {
  Badge,
  H3,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import I18n from "../../../../../../i18n";
import { CategoryTag } from "../CgnModuleDiscount";
import { isValidDiscount, normalizedDiscountPercentage } from "../utils";

type CgnDiscountHeaderProps = {
  onLayout: (event: any) => void;
  discountDetails: Discount;
};

export const CgnDiscountHeader = ({
  onLayout,
  discountDetails
}: CgnDiscountHeaderProps) => {
  const discountColor = discountDetails.isNew
    ? styles.backgroundNewItem
    : styles.backgroundDefault;

  const headerHeight = useHeaderHeight();

  const { isNew, discount, name, productCategories } = discountDetails;

  return (
    <View
      onLayout={onLayout}
      style={[
        IOStyles.horizontalContentPadding,
        {
          paddingTop: headerHeight,
          backgroundColor: discountColor.backgroundColor,
          paddingBottom: 24
        }
      ]}
    >
      <View>
        {(isNew || isValidDiscount(discount)) && (
          <>
            <View style={[IOStyles.row, { gap: 8 }]}>
              {isNew && (
                <Badge
                  variant="purple"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              )}
              {isValidDiscount(discount) && (
                <Badge
                  variant="purple"
                  outline
                  text={`-${normalizedDiscountPercentage(discount)}%`}
                />
              )}
            </View>
            <VSpacer size={12} />
          </>
        )}
        <H3>{name}</H3>
        <VSpacer size={12} />
        <View style={[{ flexWrap: "wrap" }, IOStyles.row]}>
          {productCategories.map(categoryKey => (
            <CategoryTag key={categoryKey} category={categoryKey} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundDefault: {
    backgroundColor: IOColors["grey-50"],
    borderColor: IOColors["grey-100"]
  },
  backgroundNewItem: {
    backgroundColor: IOColors["hanPurple-50"],
    borderColor: IOColors["hanPurple-250"]
  }
});
