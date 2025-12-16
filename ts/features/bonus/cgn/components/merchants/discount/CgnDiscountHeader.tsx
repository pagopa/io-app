import {
  Badge,
  H3,
  HStack,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { setAccessibilityFocus } from "../../../../../../utils/accessibility";
import { useCgnStyle } from "../../../hooks/useCgnStyle";
import { CategoryTag } from "../ModuleCgnDiscount";
import { isValidDiscount, normalizedDiscountPercentage } from "../utils";

type CgnDiscountHeaderProps = {
  discountDetails: Discount;
};

export const CgnDiscountHeader = ({
  discountDetails
}: CgnDiscountHeaderProps) => {
  const { isNew, discount, name, productCategories } = discountDetails;

  const ref = useRef<View>(null);

  useEffect(() => {
    setAccessibilityFocus(ref, 400 as Millisecond);
  }, [ref]);

  const { header: headerStyle } = useCgnStyle();

  const { backgroundColor, foreground } = isNew
    ? headerStyle.new
    : headerStyle.default;

  return (
    <View
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        backgroundColor,
        paddingBottom: 24
      }}
    >
      <View>
        {(isNew || isValidDiscount(discount)) && (
          <>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {isNew && (
                <Badge
                  variant="cgn"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              )}
              {isValidDiscount(discount) && (
                <Badge
                  variant="cgn"
                  outline
                  text={`-${normalizedDiscountPercentage(discount)}%`}
                />
              )}
            </View>
            <VSpacer size={12} />
          </>
        )}
        <H3 accessible ref={ref} color={foreground}>
          {name}
        </H3>
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
