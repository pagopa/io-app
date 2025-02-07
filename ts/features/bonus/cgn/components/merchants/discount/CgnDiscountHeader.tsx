import {
  Badge,
  H3,
  HStack,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import I18n from "../../../../../../i18n";
import { CategoryTag } from "../ModuleCgnDiscount";
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

  const { isNew, discount, name, productCategories } = discountDetails;

  return (
    <View
      onLayout={onLayout}
      style={[
        IOStyles.horizontalContentPadding,
        {
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
        <HStack space={4} style={{ flexWrap: "wrap" }}>
          {productCategories.map(categoryKey => (
            <CategoryTag key={categoryKey} category={categoryKey} />
          ))}
        </HStack>
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
