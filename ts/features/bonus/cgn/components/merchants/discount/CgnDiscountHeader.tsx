import * as E from "fp-ts/lib/Either";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Badge,
  H3,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { pipe } from "fp-ts/lib/function";
import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { CategoryTag } from "../CgnModuleDiscount";
import I18n from "../../../../../../i18n";

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

  const normalizedDiscountValue = pipe(
    WithinRangeInteger(0, 100).decode(discountDetails.discount),
    E.map(v => v.toString()),
    E.getOrElse(() => "-")
  );

  const headerHeight = useHeaderHeight();

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
        {(discountDetails.isNew || discountDetails.discount) && (
          <>
            <View style={[IOStyles.row, { gap: 8 }]}>
              {discountDetails.isNew && (
                <Badge
                  variant="purple"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              )}
              {discountDetails.discount && (
                <Badge
                  variant="purple"
                  outline
                  text={`-${normalizedDiscountValue}%`}
                />
              )}
            </View>
            <VSpacer size={12} />
          </>
        )}
        <H3>{discountDetails.name}</H3>
        <VSpacer size={12} />
        <View style={[{ flexWrap: "wrap" }, IOStyles.row]}>
          {discountDetails.productCategories.map(categoryKey => (
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
