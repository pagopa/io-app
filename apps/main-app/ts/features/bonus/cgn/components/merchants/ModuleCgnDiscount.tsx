import {
  Badge,
  H6,
  HStack,
  Icon,
  IOModuleStyles,
  Tag,
  useIOTheme,
  useScaleAnimation,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { useCgnStyle } from "../../hooks/useCgnStyle";
import { getCategorySpecs } from "../../utils/filters";
import {
  isValidDiscount,
  moduleCGNaccessibilityLabel,
  normalizedDiscountPercentage
} from "./utils";

export type ModuleCgnDiscount = {
  discount: Discount;
  onPress: () => void;
};

type CategoryTagProps = {
  category: ProductCategory;
};

export const CategoryTag = ({ category }: CategoryTagProps) => {
  const categorySpecs = getCategorySpecs(category);

  return categorySpecs ? (
    <Tag
      icon={{
        name: categorySpecs.icon,
        color: "lightGrey"
      }}
      text={I18n.t(categorySpecs.nameKey)}
      variant="custom"
    />
  ) : null;
};

export const ModuleCgnDiscount = ({ onPress, discount }: ModuleCgnDiscount) => {
  const theme = useIOTheme();

  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");
  const { module: moduleStyle } = useCgnStyle();

  const accessibilityLabel = moduleCGNaccessibilityLabel(discount);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessible
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
    >
      <Animated.View
        style={[
          { borderWidth: 1 },
          IOModuleStyles.button,
          discount.isNew ? moduleStyle.new : moduleStyle.default,
          scaleAnimatedStyle
        ]}
      >
        <View
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row"
          }}
        >
          <VStack space={8} style={{ flexShrink: 1 }}>
            {(discount.discount || discount.isNew) && (
              <HStack space={8} style={{ flexWrap: "wrap" }}>
                {discount.isNew && (
                  <Badge
                    accessible={false}
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                    variant="cgn"
                  />
                )}
                {isValidDiscount(discount.discount) && (
                  <Badge
                    accessible={false}
                    outline
                    text={`-${normalizedDiscountPercentage(
                      discount.discount
                    )}%`}
                    variant="cgn"
                  />
                )}
              </HStack>
            )}

            <H6 color={theme["textHeading-secondary"]}>{discount.name}</H6>
            <HStack space={4} style={{ flexWrap: "wrap" }}>
              {discount.productCategories.map(categoryKey => (
                <CategoryTag category={categoryKey} key={categoryKey} />
              ))}
            </HStack>
          </VStack>
          <Icon
            color={theme["interactiveElem-default"]}
            name="chevronRightListItem"
            size={24}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};
