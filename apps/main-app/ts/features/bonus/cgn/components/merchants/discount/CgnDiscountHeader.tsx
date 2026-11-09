import { Discount } from "@io-app/api-types/generated/definitions/cgn/merchants/Discount";
import {
  Badge,
  H3,
  HStack,
  IODimensions,
  VSpacer
} from "@io-app/design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { useEffect, useRef } from "react";
import { View } from "react-native";

import { setAccessibilityFocus } from "../../../../../../utils/accessibility";
import { useCgnColors } from "../../../hooks/useCgnColors";
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

  const colors = useCgnColors();

  const { backgroundColor, foreground } = isNew
    ? colors.discountHeader.new
    : colors.discountHeader.default;

  return (
    <View
      style={{
        paddingHorizontal: IODimensions.padding.screen.default,
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
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                  variant="cgn"
                />
              )}
              {isValidDiscount(discount) && (
                <Badge
                  outline
                  text={`-${normalizedDiscountPercentage(discount)}%`}
                  variant="cgn"
                />
              )}
            </View>
            <VSpacer size={12} />
          </>
        )}
        <H3 accessible color={foreground} ref={ref}>
          {name}
        </H3>
        <VSpacer size={12} />
        <HStack space={4} style={{ flexWrap: "wrap" }}>
          {productCategories.map(categoryKey => (
            <CategoryTag category={categoryKey} key={categoryKey} />
          ))}
        </HStack>
      </View>
    </View>
  );
};
